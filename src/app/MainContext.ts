import {createSafeContext} from '@sirse-dev/safe-context';
import {Dispatch, SetStateAction} from 'react';

export type MessageType = {
  message: string;
  type: 'User' | 'Assistant';
};

type MainContextType = {
  theme: 'light' | 'dark';
  setTheme: Dispatch<SetStateAction<'light' | 'dark'>>;
  messages: MessageType[];
  setMessages: React.Dispatch<React.SetStateAction<MessageType[]>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
};

export const MainContext = createSafeContext<MainContextType>();
