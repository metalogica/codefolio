import type { APIRoute } from "astro";
import OpenAI from "openai";

const MODEL = "xiaomi/mimo-v2.5-pro";

// OpenRouter speaks the OpenAI wire format, so the OpenAI SDK is the client —
// only the base URL, key, and model slug differ.
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "https://rei.gg",
    "X-Title": "rei.gg",
  },
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: body.messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return new Response(
      JSON.stringify({
        message: completion.choices[0].message.content,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch {
    return new Response(
      JSON.stringify({
        error: "Failed to generate response",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
