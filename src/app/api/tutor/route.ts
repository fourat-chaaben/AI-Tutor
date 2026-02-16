import "server-only";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an AI tutor for students.
Explain step-by-step in simple language.
If unclear, ask ONE clarifying question.
End with: (1) 2-3 line summary (2) one follow-up question.
Answer in the user's language.
`;

type Msg = { role: "user" | "assistant" | "system"; content: string };

const VALID_ROLES = new Set<Msg["role"]>(["user", "assistant", "system"]);

function normalizeHistory(history: unknown, maxMessages = 20): Msg[] {
  if (!Array.isArray(history)) return [];

  // Validate structure and role once, then normalize content
  const cleaned: Msg[] = history
    .filter((m): m is any => m && typeof m === "object" && VALID_ROLES.has(m.role))
    .map((m: any) => ({
      role: m.role as Msg["role"],
      content: String(m.content ?? "").trim(),
    }))
    .filter((m) => m.content.length > 0);

  // Keep the latest N messages to control tokens / cost
  return cleaned.slice(-maxMessages);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const question = String(body?.question ?? "").trim();
    const history = normalizeHistory(body?.history, 20);

    // Demo mode FIRST: no API key required, no external API call
    const demoMode = process.env.DEMO_MODE === "true";
    if (demoMode) {
      return NextResponse.json({
        answer:
          `[DEMO MODE]\n\n` +
          `You asked: "${question || "(empty)"}"\n\n` +
          `Tutor-style answer (mock):\n` +
          `1) Break the problem into small steps\n` +
          `2) Identify the key formula/concept\n` +
          `3) Solve a small example\n\n` +
          `Summary: Demo response (no API call).\n` +
          `Follow-up: What part feels confusing?`,
      });
    }

    // Validate input
    if (!question) {
      return NextResponse.json(
        { answer: "Please provide a non-empty question." },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { answer: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const messages: Msg[] = [
      { role: "system", content: SYSTEM_PROMPT.trim() },
      ...history,
      { role: "user", content: question },
    ];

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      }),
    });

    const data = await r.json().catch(() => ({} as any));

    if (!r.ok) {
      const msg =
        data?.error?.message ??
        (r.status ? `${r.status} ${r.statusText}` : null) ??
        "OpenAI error";
      return NextResponse.json({ answer: msg }, { status: 500 });
    }

    const answer = data?.choices?.[0]?.message?.content ?? "";
    return NextResponse.json({ answer: answer.trim() || "No answer" });
  } catch (err: any) {
    // Last-resort safety net
    const msg = err?.message ? String(err.message) : "Server error";
    return NextResponse.json({ answer: msg }, { status: 500 });
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 60cb10f079786a19986728cefd4bc3944a735e00
