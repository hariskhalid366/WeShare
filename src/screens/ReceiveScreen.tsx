import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { sendStyles } from '../styles/sendStyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Outline from 'react-native-heroicons/outline';
import CustomText from '../components/global/CustomText';
import Breaker from '../components/global/Breaker';
import { goBack, navigate } from '../utils/NavigationUtil';
import LottieView from 'lottie-react-native';
import { useTCP } from '../services/TCPProvider';
import DeviceInfo from 'react-native-device-info';
import dgram from 'react-native-udp';
import {
  getBroadcastIPAddress,
  getLocalIPAddress,
} from '../utils/networkUtils';

const ReveiveScreen = () => {
  const { startServer, server, isConnected } = useTCP();
  const [qrValue, setQRValue] = useState<any | null>(null);
  const intervelRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress();
    const port = 4000;

    if (!server) {
      startServer(port);
      setQRValue(`tcp://${ip}:${port}|${deviceName}`);
      console.log(`Server info: ${ip}:${port}`);
    }
  };

  const sendDiscoverySignal = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const broadCastAddress = await getBroadcastIPAddress();
    const targetAddress = broadCastAddress || '255.255.255.255';
    const port = 57143;
    const client = dgram.createSocket({
      type: 'udp4',
      reusePort: true,
    });

    client.bind(() => {
      try {
        if (Platform.OS === 'ios') {
          client.setBroadcast(true);
        }
        client.send(
          `${qrValue}`,
          0,
          `${qrValue}`.length,
          port,
          targetAddress,
          err => {
            if (err) {
              console.log('Error sending discovery signal ', err);
            } else {
              console.log(
                `${deviceName} Discovery signals sent to ${targetAddress}`,
              );
            }
          },
        );
      } catch (error) {
        console.log('Failed to set broadcast or send ', error);
      }
    });
  };

  useEffect(() => {
    if (!qrValue) return;

    sendDiscoverySignal();
    intervelRef.current = setInterval(sendDiscoverySignal, 3000);
    return () => {
      if (intervelRef.current) {
        clearInterval(intervelRef.current);
        intervelRef.current = null;
      }
    };
  }, []);

  const handleGoBack = () => {
    if (intervelRef.current) {
      clearInterval(intervelRef.current);
      intervelRef.current = null;
    }
    goBack();
  };

  useEffect(() => {
    if (isConnected) {
      if (intervelRef.current) {
        clearInterval(intervelRef.current);
        intervelRef.current = null;
      }
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <LinearGradient
      style={sendStyles.container}
      colors={['#fff', '#4DA0DE', '#3387C5']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={sendStyles.infoContainer}>
          <Outline.Squares2X2Icon color="#fff" size={50} />
          <CustomText
            fontFamily="Okra-Bold"
            fontSize={16}
            style={{ marginTop: 20 }}
          >
            Receiving from nearby devices
          </CustomText>
          <CustomText
            fontFamily="Okra-Regular"
            fontSize={12}
            style={{ marginTop: 10, textAlign: 'center' }}
          >
            Ensure your device is connected to the sender's hotspot network.
          </CustomText>
          <Breaker text="or" />
          <TouchableOpacity
            onPress={() => navigate('ScannerModal')}
            style={sendStyles.qrButton}
          >
            <Outline.QrCodeIcon color="#007AFF" size={24} strokeWidth={2} />
            <CustomText fontFamily="Okra-Bold" style={{ color: '#007AFF' }}>
              Scan QR
            </CustomText>
          </TouchableOpacity>
        </View>
        <View style={sendStyles.animationContainer}>
          <View style={sendStyles.lottieContainer}>
            <LottieView
              source={require('../assets/animations/scan2.json')}
              autoPlay
              loop
              style={sendStyles.lottie}
            />
          </View>
          <Image
            style={sendStyles.profileImage}
            source={require('../assets/images/profile.jpg')}
          />
        </View>
        <TouchableOpacity
          style={sendStyles.backButton}
          onPress={() => handleGoBack()}
        >
          <Outline.ArrowLeftIcon color="#000" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ReveiveScreen;

const styles = StyleSheet.create({});
