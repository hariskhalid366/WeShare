import { StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import * as Outline from 'react-native-heroicons/outline';
import { screenHeight, screenWidth } from '../../utils/Constants';
import { navigate } from '../../utils/NavigationUtil';

interface NavigatorProps {
  onScanner: () => void;
}

const NavigatorBar: FC<NavigatorProps> = ({ onScanner }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigate('DownloadScreen')}
      >
        <Outline.FolderArrowDownIcon size={24} color={'#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigate('ScannerModal')}
      >
        <Outline.QrCodeIcon size={screenWidth * 0.13} color={'#fff'} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => navigate('ConnectionScreen')}
      >
        <Outline.PaperAirplaneIcon size={24} color={'#fff'} strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
};

export default NavigatorBar;

const styles = StyleSheet.create({
  container: {
    height: screenHeight * 0.08,
    width: screenWidth,
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    borderTopRightRadius: 30,
    borderTopLeftRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
});
