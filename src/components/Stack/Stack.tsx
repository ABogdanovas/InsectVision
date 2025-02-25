import {View, ViewProps} from 'react-native';
import {useTheme} from 'react-native-paper';

export const Stack = ({style, ...props}: ViewProps) => {
  const {colors} = useTheme();

  return (
    <View style={[{backgroundColor: colors.background}, style]} {...props} />
  );
};
