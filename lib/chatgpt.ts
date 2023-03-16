import { ChatGPTUnofficialProxyAPI } from "chatgpt";

export const chatgpt = (accessToken: any) =>
  new ChatGPTUnofficialProxyAPI({ accessToken });
