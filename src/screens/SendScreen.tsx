import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { sendStyles } from '../styles/sendStyles';
import LinearGradient from 'react-native-linear-gradient';
import { useTCP } from '../services/TCPProvider';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';
import CustomText from '../components/global/CustomText';
import { goBack, navigate, resetAndNavigate } from '../utils/NavigationUtil';
import Breaker from '../components/global/Breaker';
import * as Outline from 'react-native-heroicons/outline';
import { screenWidth } from '../utils/Constants';
import dgram from 'react-native-udp';

const deviceNames = [
  'Oppo',
  'Vivo X1',
  'Redmi',
  'Samsuing S56',
  'iphone 16',
  'OnePlus 9',
];

const SendScreen = () => {
  const { connectToServer, isConnected } = useTCP();
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<any>(null);

  const handleScan = (data: any) => {
    const [connectionData, deviceName] = data?.replace('tcp://', '').split('|');
    const [host, port] = connectionData.split(':');
    connectToServer(host, parseInt(port, 10), deviceName);
  };

  const listenForDevices = () => {
    const server = dgram.createSocket({
      type: 'udp4',
      reusePort: true,
    });
    const port = 57143;
    server.bind(port, () => {
      console.log('Listening for nearby devices...');
    });

    server.on('message', (msg: any, rinfo: any) => {
      const [connectionData, otherDevice] = msg
        ?.toString()
        ?.replace('tcp://', '')
        ?.split('|');

      setNearbyDevices((prevDevices: any) => {
        const deviceExists = prevDevices?.some(
          (device: any) => device?.name === otherDevice,
        );
        if (!deviceExists) {
          const newDevice = {
            id: `${Date.now()}_${Math.random()}`,
            name: otherDevice,
            image: require('../assets/icons/device.jpeg'),
            fullAddress: msg?.toString(),
            position: getRandomPosition(
              150,
              prevDevices?.map((d: any) => d.position),
              50,
            ),
            scale: new Animated.Value(0),
          };

          Animated.timing(newDevice.scale, {
            toValue: 1,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
            duration: 1000,
          }).start();

          return [...prevDevices, newDevice];
        }
        return prevDevices;
      });
    });
  };

  const getRandomPosition = (
    radius: number,
    existingPosition: { x: number; y: number }[],
    minDistance: number,
  ) => {
    let position: any;
    let isOverLapping;
    do {
      const angle = Math.random() * 300;
      const distance = Math.random() * (radius - 50) + 50;

      const x = distance * Math.cos((angle + Math.PI) / 180);
      const y = distance * Math.sin((angle + Math.PI) / 180);
      position = { x, y };
      isOverLapping = existingPosition.some(pos => {
        const dx = pos.x - position.x;
        const dy = pos.y - position.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    } while (isOverLapping);
    return position;
  };

  useEffect(() => {
    if (isConnected) {
      resetAndNavigate('ConnectionScreen');
    }
  }, [isConnected]);

  useEffect(() => {
    let udpServer: any;
    const setupServer = async () => {
      udpServer = await listenForDevices();
    };
    setupServer();

    return () => {
      if (udpServer) {
        udpServer.close(() => {
          console.log('UDP server closed.');
        });
      }
      setNearbyDevices([]);
    };
  }, []);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#A066E5', '#A566E5']}
      style={sendStyles.container}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={sendStyles.infoContainer}>
          <Outline.MagnifyingGlassIcon strokeWidth={2} color="#fff" size={50} />
          <CustomText
            fontFamily="Okra-Bold"
            fontSize={16}
            style={{ marginTop: 20 }}
          >
            Looking for nearby devices
          </CustomText>
          <CustomText
            fontFamily="Okra-Regular"
            fontSize={12}
            style={{ marginTop: 10, textAlign: 'center' }}
          >
            Ensure your device's hotspot is actice and the receiver device is
            connected to it.
          </CustomText>
          <Breaker text="or" />
          <TouchableOpacity
            onPress={() => navigate('QrModal', { visible: true })}
            style={sendStyles.qrButton}
          >
            <Outline.QrCodeIcon color="#007AFF" size={24} strokeWidth={2} />
            <CustomText fontFamily="Okra-Bold" style={{ color: '#007AFF' }}>
              Scan QR
            </CustomText>
          </TouchableOpacity>
        </View>
        <View style={sendStyles.animationContainer}>
          {nearbyDevices?.map((device: any) => (
            <Animated.View
              key={device?.id}
              style={[
                sendStyles.deviceDot,
                {
                  transform: [{ scale: device.scale }],
                  left: screenWidth / 2.33 + device.position.x,
                  top: screenWidth / 2.33 + device.position.y,
                },
              ]}
            >
              <TouchableOpacity
                style={sendStyles.popup}
                onPress={() => handleScan(device?.fullAddress)}
              >
                <Image style={sendStyles.deviceImage} source={device?.image} />
                <CustomText
                  numberOfLines={1}
                  color="#333"
                  fontSize={8}
                  fontFamily="Okra-Bold"
                  style={sendStyles.deviceText}
                >
                  {device?.name}
                </CustomText>
              </TouchableOpacity>
            </Animated.View>
          ))}
          <View style={sendStyles.lottieContainer}>
            <LottieView
              source={require('../assets/animations/scanner.json')}
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
        <TouchableOpacity style={sendStyles.backButton} onPress={goBack}>
          <Outline.ArrowLeftIcon color="#000" size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default SendScreen;

const styles = StyleSheet.create({});
