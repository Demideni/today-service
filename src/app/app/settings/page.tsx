import { getSession } from "@/lib/auth";

export default function SettingsPage() {
  const s = getSession();
  if (!s) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <section className="bg-white border rounded-2xl p-4 space-y-2">
        <div className="text-sm font-medium">Account</div>
        <div className="text-sm opacity-80">User ID: <span className="font-mono text-xs">{s.userId}</span></div>
        <div className="text-sm opacity-80">Org ID: <span className="font-mono text-xs">{s.orgId}</span></div>
        <div className="text-sm opacity-80">Role: {s.role}</div>
      </section>

      <section className="bg-white border rounded-2xl p-4 space-y-2">
        <div className="text-sm font-medium">PWA</div>
        <div className="text-sm opacity-80">Install this app from your browser menu (“Add to Home Screen”).</div>
      </section>
    </div>
  );
}
