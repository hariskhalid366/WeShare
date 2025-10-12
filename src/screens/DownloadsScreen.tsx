import {
  ActivityIndicator,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import RNFS from 'react-native-fs';
import * as Outline from 'react-native-heroicons/outline';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendStyles } from '../styles/sendStyles';
import CustomText from '../components/global/CustomText';
import { getMimeType, useColors } from '../utils/Constants';
import { connectionStyles } from '../styles/connectionStyles';
import { formatFileSize } from '../utils/libraryHelpers';
import { modalStyles } from '../styles/modalStyles';
import ReactNativeBlobUtil from 'react-native-blob-util';

const DownloadsScreen = () => {
  const [receivedFiles, setReceivedFiles] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const fetchReceivedFiles = async () => {
    setIsLoading(true);

    const platformPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/`
        : `${RNFS.DocumentDirectoryPath}/`;

    try {
      const exists = await RNFS.exists(platformPath);
      if (!exists) {
        setReceivedFiles([]);
        setIsLoading(false);
        return;
      }

      const files = await RNFS.readDir(platformPath);

      const formattedFiles = files.map(file => ({
        id: file?.ctime?.toString() || file?.name,
        name: file?.name,
        size: file?.size,
        uri: file?.path,
        mimeType: file?.name.split('.').pop() || 'unknown',
      }));

      setReceivedFiles(formattedFiles);
    } catch (error) {
      console.error('Error fetching received files:', error);
      setReceivedFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedFiles();
  }, []);

  const Colors = useColors();

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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
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
            {formatFileSize(item?.size)}
          </CustomText>
        </View>
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
      <ScrollView style={sendStyles.mainContainer}>
        <CustomText
          fontFamily="Okra-Bold"
          fontSize={15}
          style={{ textAlign: 'center', margin: 10 }}
        >
          All Downloaded Files
        </CustomText>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.text} />
        ) : receivedFiles.length > 0 ? (
          <View style={{ flex: 1 }}>
            <FlatList
              scrollEnabled={false}
              data={receivedFiles}
              renderItem={renderItem}
              keyExtractor={item => item?.id}
              contentContainerStyle={connectionStyles.fileList}
            />
          </View>
        ) : (
          <View style={connectionStyles.noDataContainer}>
            <CustomText
              numberOfLines={1}
              fontFamily="Okra-Medium"
              fontSize={11}
            >
              No files downloaded yet
            </CustomText>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default DownloadsScreen;

const styles = StyleSheet.create({});
