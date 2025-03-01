import {PropsWithChildren, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {MainContext, MessageType} from './MainContext';
import {PaperProvider} from 'react-native-paper';
import MaterialCommunityIcons from '@react-native-vector-icons/material-design-icons';
import i18n from '../../i18n';
import {darkTheme, whiteTheme} from '../components';
import {PersistQueryClientProvider} from '@tanstack/react-query-persist-client';
import {QueryClient} from '@tanstack/react-query';
import {clientPersister} from '../utils/clientStorage';

import {StatusBar} from 'react-native';
import {globalStorage} from '../..';

function IconComponent(props: any) {
  return <MaterialCommunityIcons {...props} />;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 1,
      staleTime: 1000 * 60 * 60 * 24 * 1,
      retry: 2,
    },
  },
});

export default function RootLayout({children}: PropsWithChildren<{}>) {
  const storedTheme = globalStorage.getString('theme') as
    | 'light'
    | 'dark'
    | undefined;

  if (!storedTheme) {
    globalStorage.set('theme', 'light');
  }

  const [theme, setTheme] = useState<'light' | 'dark'>(storedTheme ?? 'light');

  const [messages, setMessages] = useState<MessageType[]>([]);

  const [language, setLanguage] = useState<string>('en');

  i18n.changeLanguage(globalStorage.getString('language'));

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{persister: clientPersister}}>
      <MainContext.Provider
        value={{
          theme: theme,
          setTheme: setTheme,
          messages: messages,
          setMessages: setMessages,
          language: language,
          setLanguage: setLanguage,
        }}>
        <PaperProvider
          theme={theme === 'light' ? whiteTheme : darkTheme}
          settings={{
            icon: IconComponent,
          }}>
          <SafeAreaProvider>
            <StatusBar translucent />
            {children}
          </SafeAreaProvider>
        </PaperProvider>
      </MainContext.Provider>
    </PersistQueryClientProvider>
  );
}
