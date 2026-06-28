import OpenAI from "openai";
import { AI_MODELS, MODEL_TEMPERATURES } from "@/constants";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function callAI<T>(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  } = {}
): Promise<{ data: T; tokens: number }> {
  const {
    model = AI_MODELS.FAST,
    temperature = MODEL_TEMPERATURES.FACTUAL,
    maxTokens = 4000,
    jsonMode = true,
  } = options;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty AI response");
  }

  const data = jsonMode ? JSON.parse(content) : content;
  return { data: data as T, tokens: response.usage?.total_tokens || 0 };
}

export async function callAIStream(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<ReadableStream<string>> {
  const {
    model = AI_MODELS.FAST,
    temperature = MODEL_TEMPERATURES.CREATIVE,
    maxTokens = 2000,
  } = options;

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const delta = chunk.choices[0]?.delta;
        const content = delta && "content" in delta ? (delta as { content: unknown }).content : null;
        if (content != null) {
          // @ts-expect-error - OpenAI types are complex for streaming
          controller.enqueue(encoder.encode(String(content)));
        }
      }
      controller.close();
    },
  });
}
