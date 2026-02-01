"use client";

import { useEffect, useRef, useState } from "react";

type Msg = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string | null; email: string };
};

export default function TaskChat({ taskId }: { taskId: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`);
      const j = await res.json();
      if (res.ok) setMsgs(j.messages || []);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send() {
    if (!body.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/tasks/${taskId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const j = await res.json();
      if (!res.ok) {
        setErr(j?.error || "Failed");
        return;
      }
      setBody("");
      await load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-3 border rounded-2xl bg-white">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-medium text-sm">Task chat</div>
        <button className="text-xs opacity-70" onClick={load}>Refresh</button>
      </div>

      <div className="p-3 space-y-2 max-h-60 overflow-auto">
        {msgs.length === 0 && <div className="text-xs opacity-60">No messages yet.</div>}
        {msgs.map((m) => (
          <div key={m.id} className="text-sm">
            <div className="text-[11px] opacity-60">
              {(m.author.name || m.author.email)} • {new Date(m.createdAt).toLocaleString()}
            </div>
            <div className="whitespace-pre-wrap">{m.body}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-3 text-sm"
          placeholder="Write a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button
          onClick={send}
          disabled={loading || !body.trim()}
          className="h-12 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium disabled:opacity-50"
        >
          Send
        </button>
      </div>

      {err && <div className="px-4 pb-3 text-xs text-red-600">{err}</div>}
    </div>
  );
}
