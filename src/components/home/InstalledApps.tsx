import {
  ActivityIndicator,
  Image,
  NativeModules,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { FC, useEffect, useState } from 'react';
import CustomText from '../global/CustomText';
import { useColors } from '../../utils/Constants';

const InstalledApps: FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [apps, setApps] = useState<any[]>([]);
  const Colors = useColors();

  const { GetInstalledApps } = NativeModules;

  const loadApps = async () => {
    try {
      setLoading(true);
      const apps = await GetInstalledApps.getInstalledApps();
      const parsed = JSON.parse(apps);
      setLoading(false);
      return parsed;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const shareApp = (apkPath: string) => {
    GetInstalledApps.getReadableApkPath(apkPath)
      .then((data: any) => console.log('Shared successfully', data))
      .catch(console.error);
  };

  // const shareApp = (apkPath: string) => {
  //   GetInstalledApps.shareApp(apkPath)
  //     .then(() => console.log('Shared successfully'))
  //     .catch(console.error);
  // };

  useEffect(() => {
    loadApps().then(setApps);
  }, []);

  return (
    <>
      <CustomText
        fontFamily="Okra-Bold"
        fontSize={15}
        style={{ textAlign: 'center', marginTop: 20 }}
      >
        Installed Apps
      </CustomText>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.text}
          style={{ marginTop: 20 }}
        />
      ) : (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginVertical: 20,

            justifyContent: 'center',
          }}
        >
          {apps.map((item, index) => (
            <TouchableOpacity
              style={{
                width: 90,
                alignItems: 'center',
                marginVertical: 5,
              }}
              key={index}
              onPress={() => shareApp(`${item?.apkPath}`)}
            >
              <Image
                source={{ uri: `data:image/png;base64,${item.icon}` }}
                style={{ width: 70, height: 70 }}
              />
              <CustomText
                style={{ textAlign: 'center', marginTop: 5 }}
                fontFamily="Okra-Medium"
                variant="h7"
                numberOfLines={1}
              >
                {item?.appName}
              </CustomText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );
};

export default InstalledApps;
