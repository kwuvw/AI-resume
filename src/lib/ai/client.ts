import OpenAI from "openai";
import { AI_MODELS, MODEL_TEMPERATURES } from "@/constants";

// ─── Singleton Client ───────────────────────────────────────────────────────
// Works with any OpenAI-compatible provider (OpenRouter, Groq, etc.)
// Reads OPENAI_API_BASE_URL and OPENAI_API_KEY from process.env at runtime.

const aiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "https://ai-resume-studio.app",
    "X-Title": "AI Resume Studio",
  },
});

/** Named export for callers that need the raw client (rare). */
export { aiClient };

// ─── JSON extraction fallback ───────────────────────────────────────────────
// Some models/providers don't support response_format: { type: "json_object" }.
// This extracts JSON from the response text as a fallback.

function extractJSON(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // continue
  }

  // Try extracting JSON from markdown code blocks
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch) {
    try {
      return JSON.parse(codeBlockMatch[1].trim());
    } catch {
      // continue
    }
  }

  // Try finding the first { ... } or [ ... ] block
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch {
      // continue
    }
  }

  throw new Error("No valid JSON found in AI response");
}

// ─── callAI — Structured JSON completion ────────────────────────────────────

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

  const response = await aiClient.chat.completions.create({
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
    throw new Error("AI returned empty response");
  }

  // ── Robust JSON parsing with fallback extraction ─────────────────────────
  let data: unknown;
  if (jsonMode) {
    try {
      data = extractJSON(content);
    } catch (parseError) {
      const snippet = content.slice(0, 300);
      console.error(
        `[AI Client] JSON parse failed — model: ${model}, content snippet: ${snippet}`,
        parseError
      );
      throw new Error(
        `AI returned invalid JSON. Snippet: "${snippet}..."`
      );
    }
  } else {
    data = content;
  }

  return { data: data as T, tokens: response.usage?.total_tokens || 0 };
}

// ─── callAIStream — Streaming completion ────────────────────────────────────

export async function callAIStream(
  systemPrompt: string,
  userPrompt: string,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): Promise<ReadableStream<Uint8Array>> {
  const {
    model = AI_MODELS.FAST,
    temperature = MODEL_TEMPERATURES.CREATIVE,
    maxTokens = 2000,
  } = options;

  const response = await aiClient.chat.completions.create({
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
        const content =
          delta && "content" in delta
            ? (delta as { content: unknown }).content
            : null;
        if (content != null) {
          const encoded = encoder.encode(String(content));
          controller.enqueue(encoded);
        }
      }
      controller.close();
    },
  });
}
