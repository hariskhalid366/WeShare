import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useTCP } from '../services/TCPProvider';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendStyles } from '../styles/sendStyles';
import * as Outline from 'react-native-heroicons/outline';
import { getMimeType, useColors } from '../utils/Constants';
import { resetAndNavigate } from '../utils/NavigationUtil';
import { connectionStyles } from '../styles/connectionStyles';
import CustomText from '../components/global/CustomText';
import Option from '../components/home/Option';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { formatFileSize } from '../utils/libraryHelpers';

const ConnectedScreen = () => {
  const {
    connectedDevices,
    disconnect,
    sendFileAck,
    sentFiles,
    receivedFiles,
    totalReceiveBytes,
    totalSentBytes,
    isConnected,
  } = useTCP();

  const Colors = useColors();

  const [activeTab, setActiveTab] = useState<'SENT' | 'RECEIVE'>('SENT');
  const renderThumbnail = (mimeType: string) => {
    switch (mimeType) {
      case 'mp4':
        return <Outline.VideoCameraIcon size={40} color={Colors.text} />;
      case 'mpeg':
      case 'mp3':
        return <Outline.MusicalNoteIcon size={40} color={Colors.text} />;
      case 'pdf':
        return <Outline.DocumentIcon size={40} color={Colors.text} />;
      case 'msword':
      case 'vnd.openxmlformats-officedocument.wordprocessingml.document':
        return <Outline.DocumentTextIcon size={40} color={Colors.text} />;
      case 'jpeg':
      case 'jpg':
      case 'png':
      case 'gif':
        return <Outline.PhotoIcon size={40} color={Colors.text} />;
      default:
        return <Outline.FolderIcon size={40} color={Colors.text} />;
    }
  };

  const onMediaPickedUp = (image: any) => {
    console.log('Picked image', image);
    sendFileAck(image, 'image');
  };

  const onFilePickedUp = (file: any) => {
    console.log('Picked image', file);
    sendFileAck(file, 'file');
  };

  useEffect(() => {
    if (!isConnected) {
      resetAndNavigate('HomeScreen');
    }
  }, [isConnected]);

  const handleTabChange = (tab: 'SENT' | 'RECEIVE') => {
    setActiveTab(tab);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      disabled={!item?.available}
      activeOpacity={0.7}
      onPress={() => {
        const normalizePath =
          Platform.OS === 'ios' ? `file://${item?.uri}` : item?.uri;
        console.log(normalizePath);

        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios
            .openDocument(normalizePath)
            .then(() => console.log('File opened successfully'))
            .catch(err => console.error('Error opening file', err));
        } else {
          ReactNativeBlobUtil.android
            .actionViewIntent(normalizePath, getMimeType(item?.uri))
            .then(() => console.log('File opened successfully'))
            .catch(err => console.error('Error opening file', err));
        }
      }}
      style={[
        connectionStyles.fileItem,
        { backgroundColor: Colors.background + '55' },
      ]}
    >
      <View style={connectionStyles.fileInfoContainer}>
        {renderThumbnail(item?.mimeType)}
        <View style={connectionStyles.fileDetails}>
          <CustomText
            color={Colors.text}
            fontFamily="Okra-Medium"
            fontSize={13}
            numberOfLines={1}
          >
            {item?.name}
          </CustomText>
          <CustomText color={Colors.text} style={{ fontSize: 11 }}>
            {item?.mimeType}-{formatFileSize(item?.size)}
          </CustomText>
        </View>
        {!item?.available && (
          <ActivityIndicator color={Colors.text} size={'small'} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      style={sendStyles.container}
      colors={['#fff', '#4DA0DE', '#3387C5']}
      start={{ x: 0, y: 1 }}
      end={{ x: 0, y: 0 }}
    >
      <SafeAreaView />
      <View style={sendStyles.mainContainer}>
        <View style={connectionStyles.container}>
          <View style={connectionStyles.connectionContainer}>
            <View style={{ width: '55%' }}>
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Medium"
                fontSize={14}
              >
                Connected With
              </CustomText>
              <CustomText
                numberOfLines={1}
                fontFamily="Okra-Bold"
                fontSize={14}
              >
                {connectedDevices || 'Unknown'}
              </CustomText>
            </View>
            <TouchableOpacity
              style={connectionStyles.disconnectButton}
              onPress={() => disconnect()}
            >
              <Outline.XMarkIcon size={24} color={'red'} />
              <CustomText
                numberOfLines={1}
                fontSize={10}
                fontFamily="Okra-Bold"
              >
                Disconnect
              </CustomText>
            </TouchableOpacity>
          </View>
          <Option
            onFilePickUp={onFilePickedUp}
            onMediaPickUp={onMediaPickedUp}
          />
          <View style={connectionStyles.fileContainer}>
            <View style={connectionStyles.sendReceiveContainer}>
              <View style={connectionStyles.sendReceiveButton}>
                <TouchableOpacity
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'SENT'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}
                  onPress={() => handleTabChange('SENT')}
                >
                  <Outline.CloudArrowUpIcon
                    color={activeTab === 'SENT' ? '#fff' : Colors.primary}
                    size={24}
                  />
                  <CustomText
                    color={activeTab === 'SENT' ? '#fff' : '#000'}
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={9}
                  >
                    SENT
                  </CustomText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    connectionStyles.sendReceiveButton,
                    activeTab === 'RECEIVE'
                      ? connectionStyles.activeButton
                      : connectionStyles.inactiveButton,
                  ]}
                  onPress={() => handleTabChange('RECEIVE')}
                >
                  <Outline.CloudArrowUpIcon
                    color={activeTab === 'RECEIVE' ? '#fff' : Colors.primary}
                    size={24}
                  />
                  <CustomText
                    color={activeTab === 'RECEIVE' ? '#fff' : '#000'}
                    numberOfLines={1}
                    fontFamily="Okra-Bold"
                    fontSize={9}
                  >
                    RECEIVE
                  </CustomText>
                </TouchableOpacity>
              </View>

              <View style={connectionStyles.sendReceiveDataContainer}>
                <CustomText fontFamily="Okra-Bold" fontSize={14}>
                  {formatFileSize(
                    activeTab === 'SENT' ? totalSentBytes : totalReceiveBytes,
                  )}
                </CustomText>
                <CustomText fontFamily="Okra-Bold">/</CustomText>
                <CustomText fontFamily="Okra-Bold">
                  {activeTab === 'SENT'
                    ? formatFileSize(
                        sentFiles?.reduce(
                          (total, file) => total + file.size,
                          0,
                        ),
                      )
                    : formatFileSize(
                        receivedFiles?.reduce(
                          (total, file) => total + file.size,
                          0,
                        ),
                      )}
                </CustomText>
              </View>
            </View>

            {(activeTab === 'SENT' ? sentFiles.length : receivedFiles?.length) >
            0 ? (
              <FlatList
                data={activeTab === 'SENT' ? sentFiles : receivedFiles}
                renderItem={renderItem}
                keyExtractor={item => item?.id?.toString()}
                contentContainerStyle={connectionStyles.fileList}
              />
            ) : (
              <View style={connectionStyles.noDataContainer}>
                <CustomText
                  numberOfLines={1}
                  fontFamily="Okra-Medium"
                  fontSize={11}
                >
                  {activeTab === 'SENT'
                    ? 'No files sent yet.'
                    : 'No files received yet.'}
                </CustomText>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => resetAndNavigate('HomeScreen')}
          style={sendStyles.backButton}
        >
          <Outline.ArrowLeftIcon color={Colors.text} size={24} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default ConnectedScreen;

const styles = StyleSheet.create({});
