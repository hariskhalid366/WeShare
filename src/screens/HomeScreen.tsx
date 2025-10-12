import { ScrollView } from 'react-native';
import React, { useState } from 'react';
import HomeHeader from '../components/home/HomeHeader';
import NavigatorBar from '../components/home/NavigatorBar';
import SendRecieveButton from '../components/home/SendRecieveButton';
import Option from '../components/home/Option';
import { screenHeight, screenWidth } from '../utils/Constants';
import InstalledApps from '../components/home/InstalledApps';
import { BlurView } from '@react-native-community/blur';

const HomeScreen = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isScannerVisible, setIsScannerVisible] = useState<boolean>(false);

  return (
    <>
      <ScrollView
        contentContainerStyle={{ paddingBottom: screenHeight * 0.1 }}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader
          onPress={() => {
            setIsVisible(!isVisible);
          }}
        />
        <SendRecieveButton />
        <Option isHome={true} />
        <InstalledApps />
      </ScrollView>

      <NavigatorBar
        onScanner={() => {
          setIsScannerVisible(!isScannerVisible);
        }}
      />
    </>
  );
};

export default HomeScreen;

{
  /* {isVisible && (
  <QrGenerateModel
    visible={isVisible}
    onClose={() => setIsVisible(!isVisible)}
  />
)} */
}
{
  /* {isScannerVisible && (
  <QrScannerModel
    visible={isScannerVisible}
    onClose={() => setIsScannerVisible(!isScannerVisible)}
  />
)} */
}
