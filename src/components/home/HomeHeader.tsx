import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import React, { FC } from 'react';
import { screenHeight, screenWidth, svgPath } from '../../utils/Constants';
import { Bars3Icon } from 'react-native-heroicons/outline';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { homeHeaderStyles } from '../../styles/homeHeaderStyles';
import { commonStyles } from '../../styles/commonStyles';
import { navigate } from '../../utils/NavigationUtil';

interface HomeHeaderProps {
  onPress?: () => void;
}

const HomeHeader: FC<HomeHeaderProps> = ({ onPress }) => {
  return (
    <View style={[homeHeaderStyles.mainContainer]}>
      <View style={[commonStyles.flexRowBetween, homeHeaderStyles.container]}>
        <TouchableOpacity
          onPress={() => navigate('QrModal', { visible: true })}
        >
          <Bars3Icon size={28} color={'#fff'} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/logo_t.png')}
          style={homeHeaderStyles.logo}
          resizeMode="contain"
        />
        <TouchableOpacity>
          <Image
            source={require('../../assets/images/profile.jpg')}
            style={{
              width: 40,
              height: 40,
              alignSelf: 'center',
              borderRadius: 100,
            }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <Svg
        height={screenHeight * 0.18}
        width={screenWidth}
        viewBox="0 0 1440 220"
        style={homeHeaderStyles.curve}
      >
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={'#007AFF'} stopOpacity="1" />
            <Stop offset="100%" stopColor={'#80BFFF'} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path d={svgPath} fill={'#80BFFF'} />
        <Path fill="url(#grad)" d={svgPath} />
      </Svg>
    </View>
  );
};

export default HomeHeader;
