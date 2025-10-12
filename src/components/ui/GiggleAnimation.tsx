import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import CustomText from '../global/CustomText';

const { width } = Dimensions.get('window');
const RADIUS = width * 0.35;

type Props = {
  nearBy?: any;
  onPress?: () => void;
};

const users = [
  { id: 1, avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 2, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 3, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 4, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 5, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 6, avatar: 'https://i.pravatar.cc/100?img=2' },
];

export default function GigglingCircleReanimated({ nearBy, onPress }: Props) {
  return (
    <View style={styles.container}>
      {nearBy.map((device: any, index: number) => (
        <GigglingUser
          key={device?.id}
          index={index}
          total={device?.length}
          avatar={device?.avatar}
          onPress={onPress}
        />
      ))}
    </View>
  );
}

const GigglingUser = ({
  index,
  total,
  avatar,
  onPress,
}: {
  index: number;
  total: number;
  avatar: string;
  onPress?: () => void;
}) => {
  const Touchable = Animated.createAnimatedComponent(TouchableOpacity);
  const angle = (2 * Math.PI * index) / total;
  const baseX = RADIUS * Math.cos(angle);
  const baseY = RADIUS * Math.sin(angle);

  const offsetX = useSharedValue(baseX);
  const offsetY = useSharedValue(baseY);

  useEffect(() => {
    const randomDelay = Math.random() * 1000;
    const randomAmpX = Math.random() * 10 - 5;
    const randomAmpY = Math.random() * 10 - 5;

    offsetX.value = withDelay(
      randomDelay,
      withRepeat(
        withTiming(baseX + randomAmpX, {
          duration: 600,
          easing: Easing.ease,
        }),
        -1, // infinite
        true, // reverse
      ),
    );

    offsetY.value = withDelay(
      randomDelay,
      withRepeat(
        withTiming(baseY + randomAmpY, {
          duration: 600,
          easing: Easing.ease,
        }),
        -1,
        true,
      ),
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offsetX.value }, { translateY: offsetY.value }],
  }));

  return (
    <Touchable
      onPress={onPress ? onPress : undefined}
      style={[styles.avatarWrapper, animatedStyle]}
    >
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <CustomText
        color="#333"
        fontFamily="Okra-Medium"
        fontSize={10}
        style={{ textAlign: 'center' }}
      >
        Haris
      </CustomText>
    </Touchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    position: 'absolute',
    zIndex: 20,
  },
  avatarWrapper: {
    position: 'absolute',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
