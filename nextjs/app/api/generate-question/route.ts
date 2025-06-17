import { NextRequest, NextResponse } from "next/server";
import { rateLimiter } from "../utils/rateLimiter";

export async function GET(req: NextRequest) {
  console.log("GET request received");
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function POST(req: NextRequest) {
  console.log("Request method:", req.method);

  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const allowed = await rateLimiter(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const { topics, participant } = await req.json();

  if (!topics || !participant) {
    return NextResponse.json(
      { error: "Missing topic or participant" },
      { status: 400 }
    );
  }

  console.log("Request body:", { topics, participant });
  console.log("Env key present:", !!process.env.OPENAI_API_KEY);

  try {
    const openAIRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: "You're an AI icebreaker generator." },
            {
              role: "user",
              content: `Generate a fun, thought-provoking icebreaker question for a group game. The question should be addressed to ${participant} and relate to the following topics: ${
                topics || "any topic"
              }.`,
            },
          ],
        }),
      }
    );

    const data = await openAIRes.json();
    const message = data?.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({ question: message });
  } catch (err) {
    return NextResponse.json(
      { error: "OpenAI request failed" },
      { status: 500 }
    );
  }
}
