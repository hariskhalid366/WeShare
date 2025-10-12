import { StyleSheet } from 'react-native';
import { screenHeight, screenWidth } from '../utils/Constants';

export const homeHeaderStyles = StyleSheet.create({
  mainContainer: {
    backgroundColor: '#007AFF',
    paddingTop: screenHeight * 0.055,
    marginBottom: screenHeight * 0.04,
  },
  container: {
    padding: 10,
    zIndex: 4,
  },
  curve: {
    position: 'absolute',
    bottom: -screenHeight * 0.099,
    left: 0.5,
    zIndex: 3,
  },
  logo: {
    width: screenWidth * 0.4,
    height: screenHeight * 0.048,
    resizeMode: 'contain',
  },
  profile: {
    width: 45,
    height: 45,
    borderRadius: 140,
    resizeMode: 'cover',
  },
});
