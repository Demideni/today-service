"use client";

import { useState } from "react";

type Member = {
  id: string;
  role: "OWNER" | "MANAGER" | "MECHANIC";
  user: { email: string; name: string | null };
};

type Invite = {
  id: string;
  email: string;
  role: "OWNER" | "MANAGER" | "MECHANIC";
  expiresAt: string;
  url: string;
};

export default function TeamClient({ members, canInvite, canEditRoles }: { members: Member[]; canInvite: boolean; canEditRoles: boolean }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Invite["role"]>("MECHANIC");
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function createInvite() {
    setBusy(true);
    setMsg(null);
    setInviteUrl(null);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j?.error || "Failed");
        return;
      }
      setInviteUrl(j.invite.url);
      setEmail("");
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(membershipId: string, nextRole: Member["role"]) {
    if (!canEditRoles) return;
    const ok = confirm(`Change role to ${nextRole}?`);
    if (!ok) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/team/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId, role: nextRole }),
      });
      const j = await res.json();
      if (!res.ok) {
        setMsg(j?.error || "Failed");
        return;
      }
      location.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {canInvite && (
        <section className="bg-white border rounded-2xl p-4 space-y-3 shadow-sm">
          <div className="font-semibold">Invite staff</div>
          <div className="grid grid-cols-1 gap-2">
            <input className="w-full border rounded-xl px-3 py-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div className="flex gap-2">
              <select className="flex-1 border rounded-xl px-3 py-3" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="MECHANIC">MECHANIC</option>
                <option value="MANAGER">MANAGER</option>
                <option value="OWNER">OWNER</option>
              </select>
              <button
                onClick={createInvite}
                disabled={busy || !email.includes("@")}
                className="h-12 px-4 rounded-xl bg-blue-600 text-white font-medium disabled:opacity-50"
              >
                Invite
              </button>
            </div>

            {inviteUrl && (
              <div className="text-sm">
                <div className="opacity-70">Share this invite link:</div>
                <div className="mt-1 flex gap-2">
                  <input className="flex-1 border rounded-xl px-3 py-2 text-xs" value={inviteUrl} readOnly />
                  <button
                    className="px-3 rounded-xl border"
                    onClick={() => navigator.clipboard.writeText(inviteUrl)}
                  >
                    Copy
                  </button>
                </div>
              </div>
            )}
            {msg && <div className="text-sm text-red-600">{msg}</div>}
          </div>
        </section>
      )}

      <section className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        {members.map((m) => (
          <div key={m.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
            <div>
              <div className="font-medium">{m.user.name ?? m.user.email}</div>
              <div className="text-xs opacity-70">{m.user.email}</div>
            </div>

            {canEditRoles ? (
              <select
                className="text-xs px-2 py-2 rounded-xl bg-slate-100 border"
                value={m.role}
                onChange={(e) => changeRole(m.id, e.target.value as any)}
              >
                <option value="OWNER">OWNER</option>
                <option value="MANAGER">MANAGER</option>
                <option value="MECHANIC">MECHANIC</option>
              </select>
            ) : (
              <div className="text-xs px-2 py-1 rounded-full bg-slate-100">{m.role}</div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
