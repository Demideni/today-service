"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function InviteAcceptPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;
  const r = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/team/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, name: name || undefined, password }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j?.error || "Failed");
        setLoading(false);
        return;
      }
      r.push("/app");
    } catch (e) {
      setMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Accept invite</h1>
          <p className="text-sm opacity-70">Create your account to join the service team.</p>
        </div>

        <div className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-3" placeholder="Your name (optional)" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-3" placeholder="Password (min 8)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {msg && <div className="text-sm text-red-600">{msg}</div>}
          <button
            onClick={submit}
            disabled={loading || password.length < 8}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
}
