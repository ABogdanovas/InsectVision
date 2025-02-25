import {FAB, FABProps} from 'react-native-paper';
import {AvailableIconNames} from '../Icon';
import {useEffect, useState} from 'react';

const robotIcons: AvailableIconNames[] = [
  'robot-outline',
  'robot-confused-outline',
  'robot-excited-outline',
  'robot-happy-outline',
  'robot-love-outline',
];

export const AssistantFAB = (props: Omit<FABProps, 'label'>) => {
  const [iconIndex, setIconIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIconIndex(Math.floor(Math.random() * robotIcons.length));
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  return <FAB icon={robotIcons[iconIndex]} animated={false} {...props} />;
};
