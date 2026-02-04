"use client";
import { useEffect, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  // load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("tutor_history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // persist chat history
  useEffect(() => {
    localStorage.setItem("tutor_history", JSON.stringify(history));
  }, [history]);

  async function send() {
    const q = input.trim();
    if (!q || loading) return;

    const nextHistory: Msg[] = [...history, { role: "user", content: q }];
    setHistory(nextHistory);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: q,
        history: nextHistory,
      }),
    });

    const data = await res.json();

    setHistory([
      ...nextHistory,
      { role: "assistant", content: data.answer ?? "No answer" },
    ]);
    setLoading(false);
  }

  function clear() {
    setHistory([]);
    localStorage.removeItem("tutor_history");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">AI Tutor</h1>

        <div className="flex gap-2">
          <textarea
            className="flex-1 border border-white/20 bg-black rounded-xl p-3"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Stell eine Lernfrage…"
          />
          <div className="flex flex-col gap-2">
            <button
              className="border border-white/20 rounded-xl px-4 py-2"
              onClick={send}
              disabled={loading}
            >
              {loading ? "…" : "Ask"}
            </button>
            <button
              className="border border-white/20 rounded-xl px-4 py-2"
              onClick={clear}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {history.map((m, i) => (
            <div
              key={i}
              className="border border-white/20 rounded-xl p-3"
            >
              <div className="font-semibold">
                {m.role === "user" ? "You" : "Tutor"}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

