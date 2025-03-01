import axios from 'axios';
import {useState} from 'react';
import {OPENAI_KEY} from '@env';

import {MainContext} from '../app/MainContext';
import {useSafeContext} from '@sirse-dev/safe-context';

export type MessageType = {
  message: string;
  type: 'Assistant' | 'User';
};

const basePrompt = `
Hello, I am an InsectVision app designed to help people with insects. Please assist our client with his questions.`;

export const sendMessage = async (
  messages: MessageType[],
  currentMessage: MessageType,
  name: string,
) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: `${basePrompt}${name}.\n\nConversation History:\n${JSON.stringify(
              messages,
            )}\n\nYou should response for this message: ${
              currentMessage.message
            }`,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response;
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error);
  }
};

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
