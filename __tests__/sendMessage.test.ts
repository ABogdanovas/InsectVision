import {sendMessage, MessageType} from '../src/services/sendMessage';
import {globalStorage} from '../globalStorage';

jest.mock('../globalStorage', () => ({
  globalStorage: {
    getString: jest.fn(),
  },
}));

describe('sendMessage', () => {
  beforeEach(() => {
    (globalStorage.getString as jest.Mock).mockReturnValue('en');
  });

  it('should call OpenAI API and return a response', async () => {
    const axios = require('axios');
    jest
      .spyOn(axios, 'post')
      .mockResolvedValue({data: {choices: [{message: {content: 'Response'}}]}});

    const messages: MessageType[] = [
      {message: 'Hello', type: 'User'},
      {message: 'Hi, how can I help you?', type: 'Assistant'},
    ];

    const response = await sendMessage(
      messages,
      {message: 'What is a beetle?', type: 'User'},
      'John',
    );

    expect(response).toBeDefined();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(response.data.choices[0].message.content).toBe('Response');
  });

  it('should include the proper language from globalStorage in the prompt', async () => {
    const axios = require('axios');
    const spy = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({data: {choices: []}});

    const messages: MessageType[] = [];
    const currentMessage: MessageType = {
      message: 'Tell me about ants',
      type: 'User',
    };

    await sendMessage(messages, currentMessage, 'John');

    const promptText = spy.mock.calls[0][1].messages[0].content;
    expect(promptText).toContain('Answer the following language in en');
  });

  it('should handle API errors gracefully', async () => {
    const axios = require('axios');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(axios, 'post').mockRejectedValue(new Error('API error'));

    const response = await sendMessage(
      [],
      {message: 'Error test', type: 'User'},
      'John',
    );

    expect(response).toBeUndefined();
  });
});
