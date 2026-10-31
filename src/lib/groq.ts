// Server-only Groq client (OpenAI-compatible API). The key never reaches the browser.
const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-oss-120b";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export class GroqError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export function groqConfigured() {
  return !!process.env.GROQ_API_KEY;
}

export async function groqChat(
  messages: ChatMessage[],
  opts: { maxTokens?: number; temperature?: number; json?: boolean; timeoutMs?: number } = {}
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new GroqError("GROQ_API_KEY not set", 503);

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: opts.temperature ?? 0.5,
    max_completion_tokens: opts.maxTokens ?? 700,
  };
  // gpt-oss models "think" first; keep that short and out of the response
  if (model.startsWith("openai/gpt-oss")) {
    body.reasoning_effort = "low";
    body.include_reasoning = false;
  }
  if (opts.json) body.response_format = { type: "json_object" };

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 20_000),
    cache: "no-store",
  });

  if (!res.ok) {
    // Log upstream detail server-side only; never forward it to clients
    console.error("groq error", res.status, (await res.text().catch(() => "")).slice(0, 300));
    throw new GroqError("LLM upstream error", res.status === 429 ? 429 : 502);
  }
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text?.trim()) throw new GroqError("Empty LLM response", 502);
  return text.trim();
}
