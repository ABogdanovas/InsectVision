import {View} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {queryCacheStorage} from '../../../utils/clientStorage';
import {queryClient} from '../../layout';
import {globalStorage} from '../../../../globalStorage';
import FastImage from '@d11/react-native-fast-image';

import RNRestart from 'react-native-restart';
import {t} from 'i18next';

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
        <Dialog.Title>{t('clearCache')}</Dialog.Title>
        <Dialog.Content>
          <View style={{marginLeft: 4}}>
            <Text variant="bodyMedium">{t('clearCacheConfirmation')}</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions style={{justifyContent: 'space-between'}}>
          <Button
            onPress={() => {
              setVisible(false);
            }}>
            {t('close')}
          </Button>
          <View style={{flexDirection: 'row'}}>
            <Button onPress={deleteAllStorage}>{t('clear')}</Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
