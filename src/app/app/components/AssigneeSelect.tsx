"use client";

import { useState } from "react";

type Option = { id: string; name: string; email: string };

export default function AssigneeSelect({
  taskId,
  currentId,
  options,
}: {
  taskId: string;
  currentId: string | null;
  options: Option[];
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function setAssignee(value: string) {
    setErr("");
    setBusy(true);
    try {
      const assignedToId = value === "" ? null : value;
      const res = await fetch(`/api/tasks/${taskId}/assign`, {
        method: "POST",
        body: JSON.stringify({ assignedToId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "assign_failed");
      }
      location.reload();
    } catch (e: any) {
      setErr(e?.message || "assign_failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <select
        className="w-full border rounded-xl px-3 py-2 text-sm bg-white"
        disabled={busy}
        value={currentId ?? ""}
        onChange={(e) => setAssignee(e.target.value)}
      >
        <option value="">Unassigned</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name || o.email}
          </option>
        ))}
      </select>
      {err && <div className="text-xs text-red-600">{err}</div>}
    </div>
  );
}
