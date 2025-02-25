import {PropsWithChildren, useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainContext, MessageType} from './MainContext';
import {PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../i18n';
import {darkTheme, whiteTheme} from '../components';
function IconComponent(props: any) {
  return <MaterialCommunityIcons {...props} />;
}

export default function RootLayout({children}: PropsWithChildren<{}>) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language');
        if (storedLanguage) {
          i18n.changeLanguage(storedLanguage);
        } else {
          i18n.changeLanguage('en');
        }
      } catch (error) {
        console.error('Failed to load language:', error);
      }
    };
    loadLanguage();
  });

  useEffect(() => {
    const saveLanguage = async () => {
      try {
        await AsyncStorage.setItem('language', i18n.language);
      } catch (error) {
        console.error('Failed to save language:', error);
      }
    };
    saveLanguage();
  }, []);

  return (
    <MainContext.Provider
      value={{
        theme: theme,
        setTheme: setTheme,
        messages: messages,
        setMessages: setMessages,
      }}>
      <PaperProvider
        theme={theme === 'light' ? whiteTheme : darkTheme}
        settings={{
          icon: IconComponent,
        }}>
        <SafeAreaProvider>{children}</SafeAreaProvider>
      </PaperProvider>
    </MainContext.Provider>
  );
}
