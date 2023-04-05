import { OpenAIStream } from "@/lib/api/stream";
import { GPT_3, GPT_4 } from "@/lib/consts/gpt";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  const { prompt, useGPT_4 } = (await req.json()) as {
    prompt?: string;
    useGPT_4?: boolean;
  };

  const payload = {
    model: useGPT_4 ? GPT_4 : GPT_3,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  };

  const stream = await OpenAIStream(payload);
  return new Response(stream);
};

export default handler;
