"use client";

import { useState } from "react";

const mapError = (e: string) => {
  if (e === "BEFORE_PHOTOS_REQUIRED") return "Upload BEFORE photos before starting.";
  if (e === "AFTER_PHOTOS_REQUIRED") return "Upload AFTER photos before marking Done.";
  return e || "Failed";
};

export default function TaskControls({ taskId }: { taskId: string }) {
  const [msg, setMsg] = useState<string>("");

  async function setStatus(status: string) {
    setMsg("");
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(mapError(j.error || "Failed"));
      return;
    }
    location.reload();
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button className="border px-3 py-2 text-sm rounded-xl bg-white" onClick={() => setStatus("IN_PROGRESS")}>
        Start
      </button>
      <button className="border px-3 py-2 text-sm rounded-xl bg-white" onClick={() => setStatus("WAITING_PARTS")}>
        Waiting parts
      </button>
      <button className="border px-3 py-2 text-sm rounded-xl bg-white" onClick={() => setStatus("DONE")}>
        Done
      </button>
      {msg && <span className="text-xs text-red-600">{msg}</span>}
    </div>
  );
}
