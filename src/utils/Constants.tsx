import { Dimensions, Platform, useColorScheme } from 'react-native';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import * as OutLine from 'react-native-heroicons/outline';

export const requestPhotoPermission = async () => {
  if (Platform.OS !== 'ios') {
    return;
  }
  try {
    const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
    if (result === RESULTS.GRANTED) {
      console.log('STORAGE PERMISSION GRANTED ✅');
    } else {
      console.log('STORAGE PERMISSION DENIED ❌');
    }
  } catch (error) {
    console.error('Error requesting permission:', error);
  }
};

export const isBase64 = (str: string) => {
  const base64Regex =
    /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/;
  return base64Regex.test(str);
};

export const screenHeight = Dimensions.get('screen').height;
export const screenWidth = Dimensions.get('screen').width;
export const multiColor = [
  '#0B3D91',
  '#1E4DFF',
  '#104E8B',
  '#4682B4',
  '#6A5ACD',
  '#7B68EE',
];
export const svgPath =
  'M0,100L120,120C240,140,480,180,720,180C960,180,1200,140,1320,120L1440,100L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z';

export const Icons = [
  { name: 'Photos', icon: OutLine.PhotoIcon, type: 'images' },
  { name: 'Videos', icon: OutLine.VideoCameraIcon, type: 'videos' },
  { name: 'Audio', icon: OutLine.MusicalNoteIcon, type: 'audios' },
  { name: 'Files', icon: OutLine.FolderOpenIcon, type: 'files' },
];

export const getMimeType = (uri: string): string => {
  if (!uri) return '*/*';
  const ext = uri.split('.').pop()?.toLowerCase() ?? '';

  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'mp4':
      return 'video/mp4';
    case 'mp3':
    case 'mpeg':
      return 'audio/mpeg';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'txt':
      return 'text/plain';
    default:
      return '*/*';
  }
};

export const useColors = () => {
  const scheme = useColorScheme(); // returns 'light' or 'dark'
  return scheme === 'dark' ? DarkColors : LightColors;
};

export enum LightColors {
  primary = '#007AFF',
  background = '#ffffff',
  icons = '#000',
  text = '#000',
  theme = '#CF551F',
  secondary = '#E5EBF5',
  tertiary = '#3C75BE',
  secondary_light = '#F6F7F9',
  primary_light = '#80BFFF',
  skeleton = '#f0f0f0',
  skeleton_Linear = '#f3f3f3',
  skeleton_Linear_Light = '#fff',
}

export enum DarkColors {
  primary = '#3399FF', // Bright blue for dark background
  background = '#000000', // Deep dark background
  icons = '#FFF',
  text = '#E6E6E6', // Soft white text
  theme = '#FF784E', // Vibrant orange accent
  secondary = '#1C1F26', // Muted secondary surface
  tertiary = '#3C8DFF', // Bright tertiary blue
  secondary_light = '#2A2E36', // Slightly lighter surface shade
  primary_light = '#66B3FF', // Lighter blue gradient tone
  skeleton = '#ffffff34',
  skeleton_Linear = '#1e1e1e',
  skeleton_Linear_Light = '#181818',
}
