import {
  ActivityIndicator,
  TouchableOpacity,
  View,
  Image,
  Vibration,
} from 'react-native';
import React, { FC, useEffect, useMemo, useState } from 'react';
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
import { CameraIcon, XMarkIcon } from 'react-native-heroicons/outline';
import {
  useCameraDevice,
  Camera,
  CodeScanner,
} from 'react-native-vision-camera';
import { goBack, resetAndNavigate } from '../../utils/NavigationUtil';
import { useTCP } from '../../services/TCPProvider';
import { sendStyles } from '../../styles/sendStyles';

interface QrScannerModelProps {
  visible?: boolean;
  onClose?: () => void;
}

const QrScannerModel: FC<QrScannerModelProps> = ({ visible, onClose }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [codeFound, setCodeFound] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const device = useCameraDevice('back');
  const shimmerTranslateX = useSharedValue(-200);
  const { connectToServer, isConnected } = useTCP();

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  useEffect(() => {
    const getPermission = async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };
    getPermission();

    if (loading) {
      setLoading(true);
      const timer = setTimeout(() => {
        setLoading(false);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, { duration: 1500, easing: Easing.linear }),
      -1,
      false,
    );
  }, []);

  const handleScan = (data: any) => {
    console.log('connection', data);

    const [connectionData, deviceName] = data.replace('tcp://', '').split('|');
    const [host, port] = connectionData?.split(':');
    connectToServer(host, parseInt(port, 10), deviceName);
  };

  const codeScanner = useMemo<CodeScanner>(
    () => ({
      codeTypes: ['qr', 'ean-13'],
      onCodeScanned: codes => {
        if (codeFound) {
          return;
        }
        console.log(`Scanned ${codes.length} codes!`);
        if (codes.length > 0) {
          const scannedData = codes[0].value;
          console.log(codes);
          setCodeFound(true);
          Vibration.vibrate([0, 1000, 100, 1000], false);
          handleScan(scannedData);
        }
      },
    }),
    [codeFound],
  );

  useEffect(() => {
    if (isConnected) resetAndNavigate('ConnectionScreen');
  }, [isConnected]);

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
        {loading ? (
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
          <>
            {!device || !hasPermission ? (
              <View style={modalStyles.skeleton}>
                <Image
                  style={modalStyles.noCameraImage}
                  source={require('../../assets/images/no_camera.png')}
                />
              </View>
            ) : (
              <View style={modalStyles.skeleton}>
                <Camera
                  style={modalStyles.camera}
                  device={device}
                  isActive={true}
                  codeScanner={codeScanner}
                />
              </View>
            )}
          </>
        )}
      </View>
      <View style={modalStyles.info}>
        <CustomText style={modalStyles.infoText1}>
          Ensure you're on the same Wi-Fi network
        </CustomText>
        <CustomText style={modalStyles.infoText2}>
          Ask the receiver to show QR code to connect and transfer files
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

export default QrScannerModel;
