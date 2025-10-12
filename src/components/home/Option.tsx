import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import {
  Icons,
  screenHeight,
  screenWidth,
  useColors,
} from '../../utils/Constants';
import CustomText from '../global/CustomText';
import { useTCP } from '../../services/TCPProvider';
import { navigate } from '../../utils/NavigationUtil';
import { pickDocument, pickImage } from '../../utils/libraryHelpers';

interface OptionProps {
  isHome?: boolean;
  onFilePickUp?: (file: any) => void;
  onMediaPickUp?: (media: any) => void;
}

const Option: FC<OptionProps> = ({ isHome, onFilePickUp, onMediaPickUp }) => {
  const Colors = useColors();
  const { isConnected } = useTCP();

  const handleUniversalPicker = async (type: string) => {
    if (isHome) {
      if (isConnected) {
        navigate('ConnectionScreen');
      } else {
        navigate('SendScreen');
      }
      return;
    }
    if (type === 'images' && onMediaPickUp) {
      pickImage(onMediaPickUp);
    }
    if (type === 'files' && onFilePickUp) {
      pickDocument(onFilePickUp);
    }
    if (type === 'videos' && onMediaPickUp) {
      pickDocument(onMediaPickUp);
    }
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: screenHeight * 0.02,
      }}
    >
      {Icons.map((Item, index) => (
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => handleUniversalPicker(Item?.type)}
          style={{ alignItems: 'center' }}
          key={index}
        >
          <Item.icon size={screenWidth * 0.08} color={Colors.primary} />
          <CustomText style={{ marginTop: 5 }} fontFamily="Okra-Medium">
            {Item?.name}
          </CustomText>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Option;
