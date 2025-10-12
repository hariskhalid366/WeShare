import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { screenHeight, screenWidth } from '../../utils/Constants';
import { navigate } from '../../utils/NavigationUtil';

const SendRecieveButton = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigate('SendScreen')}
      >
        <Image
          style={styles.img}
          source={require('../../assets/icons/send.jpg')}
        />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigate('ReveiveScreen')}
      >
        <Image
          style={styles.img}
          source={require('../../assets/icons/receive.jpg')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SendRecieveButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: screenHeight * 0.02,
  },
  img: {
    width: screenWidth * 0.37,
    height: screenWidth * 0.25,
    borderRadius: 20,
    elevation: 5,
  },
});
