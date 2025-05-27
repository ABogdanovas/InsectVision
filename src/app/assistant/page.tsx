import {Appbar} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {Platform} from 'react-native';
import {KeyboardAvoidingView} from 'react-native';
import {Chat, Stack} from '../../components';
import {t} from 'i18next';

export default function AssistantPage() {
  const {goBack} = useNavigation();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <Appbar.Header elevated>
        <Appbar.Action
          icon="arrow-left"
          onPress={() => {
            goBack();
          }}
        />
        <Appbar.Content title={t('yourAssistant')} />
      </Appbar.Header>
      <Stack style={{flex: 1}}>
        <Chat model="gpt-3.5-turbo" name="" />
      </Stack>
    </KeyboardAvoidingView>
  );
}
