import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import { modalStyles } from '../../styles/modalStyles';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { multiColor, useColors } from '../../utils/Constants';
import CustomText from '../global/CustomText';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { goBack, resetAndNavigate } from '../../utils/NavigationUtil';
import DeviceInfo from 'react-native-device-info';
import {
  getBroadcastIPAddress,
  getLocalIPAddress,
} from '../../utils/networkUtils';
import { useTCP } from '../../services/TCPProvider';

interface QrGenerateModelProps {
  onClose?: () => void;
  route?: any;
}

const QrGenerateModel: FC<QrGenerateModelProps> = ({ onClose, route }) => {
  const { visible } = route?.params;

  const [loading, setLoading] = useState<boolean>(true);
  const [qrValue, setQrValue] = useState<string>('Haris');
  const shimmerTranslateX = useSharedValue(-200);
  const { isConnected, startServer, server } = useTCP();

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const setupServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ipAddress = await getLocalIPAddress();
    const port = 4000;

    if (server) {
      setQrValue(`tcp://${ipAddress}:${port}|${deviceName}`);
      setLoading(false);
    }
    startServer(port);
    setQrValue(`tcp://${ipAddress}:${port}|${deviceName}`);
    console.log(`Server info ${ipAddress}:${port}`);
    setLoading(false);
  };

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );

    if (visible) {
      setLoading(true);
      setupServer();
    }
  }, [visible]);

  useEffect(() => {
    console.log('TcpProvider: isConnected updated to', isConnected);
    if (isConnected) {
      resetAndNavigate('ConnectionScreen');
    }
  }, []);

  const Colors = useColors();

  return (
    // <Modal
    //   visible={visible}
    //   onRequestClose={onClose}
    //   onDismiss={onClose}
    //   backdropColor={'#ffffff55'}
    //   animationType="slide"
    //   presentationStyle="formSheet"
    // >
    <View
      style={[
        modalStyles.modalContainer,
        { backgroundColor: Colors.background },
      ]}
    >
      <View style={modalStyles.qrContainer}>
        {loading || qrValue === null || qrValue === '' ? (
          <View
            style={[modalStyles.skeleton, { backgroundColor: Colors.skeleton }]}
          >
            <Animated.View style={shimmerStyle}>
              <LinearGradient
                colors={[
                  Colors.skeleton_Linear,
                  Colors.skeleton_Linear_Light,
                  Colors.skeleton_Linear,
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={modalStyles.shimmerGradient}
              />
            </Animated.View>
          </View>
        ) : (
          <QRCode
            value={qrValue}
            size={250}
            logoSize={60}
            logoBackgroundColor="#fff"
            logoBorderRadius={10}
            logoMargin={2}
            logo={require('../../assets/images/profile.jpg')}
            linearGradient={multiColor}
            enableLinearGradient
            backgroundColor="#fff"
            quietZone={20}
          />
        )}
      </View>
      <View style={modalStyles.info}>
        <CustomText style={modalStyles.infoText1}>
          Ensure you're on the same Wi-Fi network
        </CustomText>
        <CustomText style={modalStyles.infoText2}>
          Ask the sender to scan this QR code to connect and transfer files
        </CustomText>
      </View>
      <ActivityIndicator
        size="small"
        color={Colors.text}
        style={{ alignSelf: 'center' }}
      />
      <TouchableOpacity onPress={goBack} style={modalStyles.closeButton}>
        <XMarkIcon size={24} color={'#000'} />
      </TouchableOpacity>
    </View>
    // </Modal>
  );
};

export default QrGenerateModel;
