import {View} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {queryCacheStorage} from '../../../utils/clientStorage';
import {queryClient} from '../../layout';
import {globalStorage} from '../../../..';
import FastImage from '@d11/react-native-fast-image';

import RNRestart from 'react-native-restart';

type DeleteDataModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export const DeleteDataModal = ({
  setVisible,
  visible,
}: DeleteDataModalProps) => {
  const deleteAllStorage = async () => {
    queryClient.removeQueries();
    queryCacheStorage.clearAll();
    globalStorage.clearAll();
    await FastImage.clearDiskCache();
    await FastImage.clearMemoryCache();
    await RNRestart.restart();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}>
        <Dialog.Title>Clear cache</Dialog.Title>
        <Dialog.Content>
          <View style={{marginLeft: 4}}>
            <Text variant="bodyMedium">
              This option will permanently remove all your app data, including
              settings, history and cache.
            </Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions style={{justifyContent: 'space-between'}}>
          <Button
            onPress={() => {
              setVisible(false);
            }}>
            Close
          </Button>
          <View style={{flexDirection: 'row'}}>
            <Button onPress={deleteAllStorage}>Clear</Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
