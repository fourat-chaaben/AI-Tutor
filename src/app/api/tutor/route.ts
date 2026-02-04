import "server-only";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `
You are an AI tutor for students.
Explain step-by-step in simple language.
If unclear, ask ONE clarifying question.
End with: (1) 2-3 line summary (2) one follow-up question.
Answer in the user's language.
`;



export async function POST(req: Request) {
  const { question, history } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ answer: "Missing OPENAI_API_KEY" }, { status: 500 });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...(Array.isArray(history) ? history : []),
    { role: "user", content: String(question || "") },
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

  const demoMode = process.env.DEMO_MODE === "true";

if (demoMode) {
  const q = String(question || "");
  return NextResponse.json({
    answer:
      `[DEMO MODE]\n\n` +
      `You asked: "${q}"\n\n` +
      `Tutor-style answer (mock):\n` +
      `1) Break the problem into small steps\n` +
      `2) Identify the key formula/concept\n` +
      `3) Solve a small example\n\n` +
      `Summary: Demo response (no API call).\n` +
      `Follow-up: What part feels confusing?`,
  });
}

  const data = await r.json();

  if (!r.ok) {
    const msg =
      data?.error?.message ??
      `${r.status} ${r.statusText}` ??
      "OpenAI error";
    return NextResponse.json({ answer: msg }, { status: 500 });
  }

  const answer = data?.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ answer: answer.trim() || "No answer" });
}
