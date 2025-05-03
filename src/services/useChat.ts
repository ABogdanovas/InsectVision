import {useState} from 'react';

import {MainContext} from '../app/MainContext';
import {useSafeContext} from '@sirse-dev/safe-context';
import {sendMessage} from './sendMessage';

type UseChatProps = {
  name: string;
  model: string;
};

export const useChat = ({name}: UseChatProps) => {
  const {messages, setMessages} = useSafeContext(MainContext);

  const [isLoading, setIsLoading] = useState(false);

  const sendNewMessage = async (newMessage: string) => {
    setIsLoading(true);

    setMessages(prevMessages => [
      ...prevMessages,
      {message: newMessage, type: 'User', chatName: name},
    ]);

    const response = await sendMessage(
      messages.map(value => {
        return {type: value.type, message: value.message};
      }),
      {message: newMessage, type: 'User'},
      name,
    );

    if (response) {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          message: response.data.choices[0].message.content,
          type: 'Assistant',
          chatName: name,
        },
      ]);
    }
    setIsLoading(false);
  };

  const filteredMessages = messages.map(value => {
    return {type: value.type, message: value.message};
  });

  const sortedMessages = [...filteredMessages];
  sortedMessages.reverse();
  return {messages: sortedMessages, sendNewMessage, isLoading};
};
