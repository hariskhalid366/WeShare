/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { Platform, StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation/Navigation';
import { BlurView } from '@react-native-community/blur';
import { useEffect } from 'react';
import { checkFilePermissions } from './src/utils/libraryHelpers';
import { requestPhotoPermission, screenWidth } from './src/utils/Constants';

function App() {
  useEffect(() => {
    checkFilePermissions(Platform.OS);
    requestPhotoPermission();
  }, []);
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <BlurView
        style={{
          position: 'absolute',
          zIndex: 2,
          top: 0,
          maxWidth: screenWidth * screenWidth,
          width: screenWidth,
          height: 40,
        }}
        blurAmount={4}
        blurRadius={6}
        blurType="light"
      />
      <Navigation mode={isDarkMode} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
