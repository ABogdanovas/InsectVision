import {FAB, FABProps} from 'react-native-paper';
import {AvailableIconNames} from '../Icon';
import {useEffect, useState} from 'react';
import Animated, {useAnimatedStyle, withTiming} from 'react-native-reanimated';
import {Platform} from 'react-native';

const robotIcons: AvailableIconNames[] = [
  'robot-outline',
  'robot-confused-outline',
  'robot-excited-outline',
  'robot-happy-outline',
  'robot-love-outline',
];

const AnimatedFAB = Animated.createAnimatedComponent(FAB);

export const AssistantFAB = ({
  style,
  isVisible,
  ...other
}: Omit<FABProps, 'label'> & {isVisible?: boolean}) => {
  const [iconIndex, setIconIndex] = useState(0);

  const animation = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isVisible ? 1 : 0),
      transform: [
        {
          scale: withTiming(isVisible ? 1 : 0),
        },
      ],
      zIndex: isVisible ? 10 : -1,
    };
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIconIndex(Math.floor(Math.random() * robotIcons.length));
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <AnimatedFAB
      testID="assistant-fab"
      sharedTransitionTag={
        Platform.OS === 'android' ? 'assistant-fab' : undefined
      }
      style={[animation, style]}
      icon={robotIcons[iconIndex]}
      animated={false}
      {...other}
    />
  );
};
