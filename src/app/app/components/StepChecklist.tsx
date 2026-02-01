"use client";

import { useState } from "react";

type Step = {
  id: string;
  title: string;
  tools: string | null;
  done: boolean;
  order: number;
};

export default function StepChecklist({ steps }: { steps: Step[] }) {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string>("");

  const items = steps.slice().sort((a, b) => a.order - b.order);
  const doneCount = items.filter((s) => s.done).length;

  async function toggle(id: string) {
    setErr("");
    setBusyId(id);
    try {
      const res = await fetch(`/api/steps/${id}/toggle`, { method: "POST" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "toggle_failed");
      }
      location.reload();
    } catch (e: any) {
      setErr(e?.message || "toggle_failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs opacity-70">
        <span>Checklist</span>
        <span>{doneCount}/{items.length}</span>
      </div>

      <div className="space-y-2">
        {items.map((s) => (
          <button
            key={s.id}
            onClick={() => toggle(s.id)}
            disabled={busyId === s.id}
            className={[
              "w-full text-left border rounded-xl px-3 py-2",
              s.done ? "bg-green-50 border-green-200" : "bg-white",
            ].join(" ")}
          >
            <div className="flex items-start gap-2">
              <div className={[
                "mt-0.5 h-4 w-4 rounded border flex items-center justify-center text-[10px]",
                s.done ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-300",
              ].join(" ")}>
                {s.done ? "✓" : ""}
              </div>
              <div className="flex-1">
                <div className={["text-sm font-medium", s.done ? "line-through opacity-70" : ""].join(" ")}>
                  {s.title}
                </div>
                {s.tools && <div className="text-xs opacity-70">Tools: {s.tools}</div>}
              </div>
            </div>
          </button>
        ))}
      </div>

      {err && <div className="text-xs text-red-600">{err}</div>}
    </div>
  );
}
