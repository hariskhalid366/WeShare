package com.weshare

import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.util.Base64
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.File

class GetInstalledAppsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "GetInstalledApps"
    }

    // Convert app icon to Base64 string
    private fun encodeIconToBase64(icon: Drawable): String {
        val bitmap = if (icon is BitmapDrawable) {
            icon.bitmap
        } else {
            // Convert non-bitmap drawable to bitmap
            val bmp = Bitmap.createBitmap(
                icon.intrinsicWidth.takeIf { it > 0 } ?: 1,
                icon.intrinsicHeight.takeIf { it > 0 } ?: 1,
                Bitmap.Config.ARGB_8888
            )
            val canvas = android.graphics.Canvas(bmp)
            icon.setBounds(0, 0, canvas.width, canvas.height)
            icon.draw(canvas)
            bmp
        }

        val outputStream = ByteArrayOutputStream()
        bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
        val byteArray = outputStream.toByteArray()
        return Base64.encodeToString(byteArray, Base64.DEFAULT)
    }

    @ReactMethod
    fun getInstalledApps(promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            val packages: List<ApplicationInfo> = pm.getInstalledApplications(0)
            val apps = JSONArray()

            for (appInfo in packages) {
                // Only user-installed apps (ignore system apps)
                if ((appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0) {
                    val app = JSONObject()
                    app.put("appName", pm.getApplicationLabel(appInfo).toString())
                    app.put("packageName", appInfo.packageName)
                    app.put("apkPath", appInfo.sourceDir)

                    // Safely encode icon
                    try {
                        val iconDrawable = pm.getApplicationIcon(appInfo)
                        val base64Icon = encodeIconToBase64(iconDrawable)
                        app.put("icon", base64Icon)
                    } catch (_: Exception) {
                        app.put("icon", "")
                    }

                    apps.put(app)
                }
            }

            promise.resolve(apps.toString())
        } catch (e: Exception) {
            promise.reject("Error", e)
        }
    }

    @ReactMethod
    fun shareApp(apkPath: String, promise: Promise) {
        try {
            val srcFile = File(apkPath)
            if (!srcFile.exists()) {
                promise.reject("FileNotFound", "Source APK not found at $apkPath")
                return
            }

            // Copy APK to app's cache folder
            val destDir = File(reactContext.cacheDir, "shared_apks")
            if (!destDir.exists()) destDir.mkdirs()

            val destFile = File(destDir, srcFile.name)
            srcFile.inputStream().use { input ->
                destFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            // Get content URI via FileProvider
            val apkUri: Uri = FileProvider.getUriForFile(
                reactContext,
                reactContext.packageName + ".provider",
                destFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "application/vnd.android.package-archive"
                putExtra(Intent.EXTRA_STREAM, apkUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(shareIntent, "Share App APK")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactContext.startActivity(chooser)

            promise.resolve("Shared successfully")
        } catch (e: Exception) {
            promise.reject("ShareError", e)
        }
    }
    
    @ReactMethod
    fun getReadableApkPath(apkPath: String, promise: Promise) {
        try {
            val srcFile = File(apkPath)
            if (!srcFile.exists()) {
                promise.reject("FileNotFound", "APK not found at $apkPath")
                return
            }

            val destDir = File(reactContext.cacheDir, "apks")
            if (!destDir.exists()) destDir.mkdirs()

            val destFile = File(destDir, srcFile.name)

            // Copy APK file into accessible cache folder
            srcFile.inputStream().use { input ->
                destFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            // Return the new absolute path
            promise.resolve(destFile.absolutePath)
        } catch (e: Exception) {
            promise.reject("PathError", e)
        }
    }
}
