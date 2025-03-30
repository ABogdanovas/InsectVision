import {GestureResponderEvent, Pressable, PressableProps} from 'react-native';
import {StateLayer} from '../StateLayer';
import {PropsWithChildren, useState} from 'react';
import {StateLayerProps} from '../StateLayer/StateLayer';

type AnimatedPressableProps = PropsWithChildren<
  {
    stateLayerProps?: StateLayerProps;
    skipPressOutAnimation?: boolean;
  } & PressableProps
>;

export const AnimatedPressable = ({
  onPress,
  onPressIn,
  onPressOut,
  stateLayerProps,
  ...props
}: AnimatedPressableProps) => {
  const [pressed, setPressed] = useState(false);
  return (
    <Pressable
      onPressIn={(event: GestureResponderEvent) => {
        setPressed(true);
        onPressIn?.(event);
      }}
      onPressOut={(event: GestureResponderEvent) => {
        setPressed(false);
        onPressOut?.(event);
      }}
      onPress={onPress}
      {...props}>
      <StateLayer pressed={pressed} {...stateLayerProps} />
      {props.children}
    </Pressable>
  );
};
