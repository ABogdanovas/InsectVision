import {View} from 'react-native';
import {Button, Dialog, Portal, Text} from 'react-native-paper';
import {queryCacheStorage} from '../../../utils/clientStorage';
import {queryClient} from '../../layout';
import {globalStorage} from '../../../..';
import RNRestart from 'react-native-restart';
type DeleteDataModalProps = {
  visible: boolean;
  setVisible: (visible: boolean) => void;
};

export const DeleteDataModal = ({
  setVisible,
  visible,
}: DeleteDataModalProps) => {
  const deleteAllStorage = () => {
    queryClient.removeQueries();
    queryCacheStorage.clearAll();
    globalStorage.clearAll();
    RNRestart.restart();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={() => {
          setVisible(false);
        }}>
        <Dialog.Title>Delete data</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">
            Please choose one of the options below:
          </Text>
          <View style={{marginLeft: 4}}>
            <Text variant="bodyMedium">
              • Delete All App Data: This option will permanently remove all
              your app data, including settings, history and cache. Use this if
              you want a complete reset of the app.
            </Text>
            <Text variant="bodyMedium">
              • Delete Only History: This option will clear only your scan
              history while keeping your settings and other app data intact.
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
            <Button
              onPress={() => {
                deleteAllStorage();
                setVisible(false);
              }}>
              All data
            </Button>
            <Button
              onPress={() => {
                setVisible(false);
              }}>
              History
            </Button>
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
