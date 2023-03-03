import { ChatGPTUnofficialProxyAPI } from 'chatgpt';

export const chatgpt = (accessToken) =>
	new ChatGPTUnofficialProxyAPI({ accessToken });
