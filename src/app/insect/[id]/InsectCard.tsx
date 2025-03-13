import {PropsWithChildren} from 'react';
import {Card} from 'react-native-paper';

export const InsectCard = ({
  children,
  title,
}: PropsWithChildren<{title: string}>) => {
  return (
    <Card>
      <Card.Title title={title} />
      <Card.Content>{children}</Card.Content>
    </Card>
  );
};
