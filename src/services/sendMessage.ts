import axios from 'axios';
import {globalStorage} from '../../globalStorage';
import {OPENAI_KEY} from '@env';

export type MessageType = {
  message: string;
  type: 'Assistant' | 'User';
};

export const sendMessage = async (
  messages: MessageType[],
  currentMessage: MessageType,
  name: string,
) => {
  try {
    const basePrompt = `
    Hello, I am an InsectVision app designed to help people with insects. Please assist our client with his questions. Answer the following language in ${
      globalStorage.getString('language') || 'en'
    }.`;

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
