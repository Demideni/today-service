"use client";

import { useState } from "react";

const mapErr = (e: string) => {
  if (e === "PASSWORD_TOO_SHORT") return "Password must be at least 8 characters.";
  if (e === "EMAIL_IN_USE") return "Email is already in use.";
  if (e === "JWT_SECRET_MISSING") return "Server misconfigured: JWT_SECRET missing.";
  return e || "Register failed";
};

export default function Register() {
  const [err, setErr] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr("");
    const form = new FormData(e.currentTarget);
    const body = {
      orgName: String(form.get("orgName") || ""),
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      password: String(form.get("password") || ""),
    };

    const res = await fetch("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(mapErr(j.error || "Register failed"));
      return;
    }
    location.href = "/app";
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-2xl font-semibold">Register service</div>

        <form className="bg-white border rounded-2xl p-4 space-y-3" onSubmit={onSubmit}>
          <label className="block">
            <div className="text-xs opacity-70 mb-1">Shop name</div>
            <input className="border rounded-xl px-3 py-2 w-full" name="orgName" placeholder="rocketrepair" required />
          </label>

          <label className="block">
            <div className="text-xs opacity-70 mb-1">Your name</div>
            <input className="border rounded-xl px-3 py-2 w-full" name="name" placeholder="Denis" required />
          </label>

          <label className="block">
            <div className="text-xs opacity-70 mb-1">Email</div>
            <input className="border rounded-xl px-3 py-2 w-full" name="email" placeholder="you@mail.com" type="email" required />
          </label>

          <label className="block">
            <div className="text-xs opacity-70 mb-1">Password</div>
            <input className="border rounded-xl px-3 py-2 w-full" name="password" placeholder="Minimum 8 chars" type="password" required />
          </label>

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button className="w-full bg-blue-600 text-white rounded-xl py-2 font-medium">Create account</button>

          <div className="text-sm opacity-80">
            Already have an account? <a className="underline" href="/login">Login</a>
          </div>
        </form>
      </div>
    </main>
  );
}
