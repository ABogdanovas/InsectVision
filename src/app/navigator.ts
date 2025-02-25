import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NativeStackNavigatorProps} from '@react-navigation/native-stack/lib/typescript/src/types';

export const options: Omit<NativeStackNavigatorProps, 'children'> = {
  screenOptions: {
    headerShown: false,
    contentStyle: {
      backgroundColor: 'transparent',
    },
  },
};

export default createNativeStackNavigator();
