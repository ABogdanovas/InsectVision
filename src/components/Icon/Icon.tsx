import {Icon as PaperIcon} from 'react-native-paper';
import {IconProps as PaperIconProps} from 'react-native-paper/lib/typescript/components/MaterialCommunityIcon';

import names from '@react-native-vector-icons/material-design-icons/glyphmaps/MaterialDesignIcons.json';

export type AvailableIconNames = keyof typeof names;

export type IconProps = {
  name: AvailableIconNames;
} & Omit<PaperIconProps, 'source' | 'direction'>;

export const Icon = ({name, ...other}: IconProps) => {
  return <PaperIcon source={name} {...other} />;
};
