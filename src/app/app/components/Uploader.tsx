"use client";

import { useRef, useState } from "react";

export default function Uploader({ taskId, kind }: { taskId: string; kind: "BEFORE" | "AFTER" }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  async function upload() {
    setErr("");
    const f = ref.current?.files?.[0];
    if (!f) return;

    setBusy(true);
    try {
      const pres = await fetch(`/api/tasks/${taskId}/media/presign`, {
        method: "POST",
        body: JSON.stringify({ kind, contentType: f.type || "image/jpeg" }),
      });
      const presJ = await pres.json().catch(() => ({}));
      if (!pres.ok) throw new Error(presJ.error || "presign_failed");

      const { uploadUrl, publicUrl } = presJ;

      const put = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": f.type || "image/jpeg" },
        body: f,
      });
      if (!put.ok) throw new Error("upload_failed");

      const commit = await fetch(`/api/tasks/${taskId}/media/commit`, {
        method: "POST",
        body: JSON.stringify({ kind, url: publicUrl }),
      });
      const commitJ = await commit.json().catch(() => ({}));
      if (!commit.ok) throw new Error(commitJ.error || "commit_failed");

      location.reload();
    } catch (e: any) {
      if (String(e?.message).includes("S3_NOT_CONFIGURED")) {
        setErr("S3 is not configured. Add S3_* env vars to enable photo uploads.");
      } else {
        setErr(e?.message || "upload_error");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input ref={ref} type="file" accept="image/*" capture="environment" className="text-sm" />
      <button disabled={busy} className="border px-3 py-2 text-sm rounded-xl bg-white" onClick={upload}>
        {busy ? "Uploading..." : `Upload ${kind}`}
      </button>
      {err && <span className="text-xs text-red-600">{err}</span>}
    </div>
  );
}
