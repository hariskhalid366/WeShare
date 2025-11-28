import React, { FC } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SendScreen from '../screens/SendScreen';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../utils/NavigationUtil';
import ReceiveScreen from '../screens/ReceiveScreen';
import DownloadsScreen from '../screens/DownloadsScreen';
import QrScannerModel from '../components/modal/QrScannerModel ';
import QrGenerateModel from '../components/modal/QrGenerateModel';
import { useColors } from '../utils/Constants';
import { TCPProvider } from '../services/TCPProvider';
import ConnectedScreen from '../screens/ConnectedScreen';

const Stack = createNativeStackNavigator();

interface NavigationProps {
  mode?: boolean;
}

const Navigation: FC<NavigationProps> = ({ mode = false }) => {
  const Colors = useColors();
  const style = mode ? '#000000' : '#FFFFFF';
  return (
    <TCPProvider>
      <NavigationContainer
        ref={navigationRef}
        theme={{
          dark: mode,
          fonts: {
            regular: { fontFamily: 'Okra-Regular', fontWeight: '400' },
            medium: { fontFamily: 'Okra-Medium', fontWeight: '500' },
            bold: { fontFamily: 'Okra-Bold', fontWeight: '700' },
            heavy: { fontFamily: 'Okra-ExtraBold', fontWeight: '800' },
          },
          colors: {
            primary: style,
            background: style,
            card: style,
            text: style,
            border: style,
            notification: style,
          },
        }}
      >
        <Stack.Navigator
          initialRouteName="HomeScreen"
          screenOptions={{
            headerShown: false,
            animation: 'ios_from_right',
            contentStyle: { backgroundColor: Colors.background },
            orientation: 'portrait_up',
          }}
        >
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="SendScreen" component={SendScreen} />
          <Stack.Screen name="ReceiveScreen" component={ReceiveScreen} />
          <Stack.Screen name="ConnectionScreen" component={ConnectedScreen} />
          <Stack.Screen name="DownloadScreen" component={DownloadsScreen} />
          <Stack.Screen
            name="ScannerModal"
            component={QrScannerModel}
            options={{
              presentation: 'formSheet',
            }}
          />
          <Stack.Screen
            name="QrModal"
            component={QrGenerateModel}
            options={{
              presentation: 'formSheet',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </TCPProvider>
  );
};

export default Navigation;
