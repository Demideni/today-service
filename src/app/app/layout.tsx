import { getSession } from "@/lib/auth";
import BottomNav from "./components/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const s = getSession();

  if (!s) {
    return (
      <main className="min-h-screen p-6 max-w-md mx-auto">
        <div className="text-xl font-semibold">AutoService</div>
        <p className="mt-3 text-sm opacity-80">You are not logged in.</p>
        <div className="mt-4 flex gap-3">
          <a className="underline" href="/login">Login</a>
          <a className="underline" href="/register">Register</a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <div className="font-semibold leading-tight">AutoService</div>
            <div className="text-xs opacity-70">Role: {s.role}</div>
          </div>
          <form action="/api/auth/logout" method="post">
            <button className="text-sm border px-3 py-1.5 rounded-lg">Logout</button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-4 pb-32">
        {children}
      </main>

      <BottomNav role={s.role} />
    </div>
  );
}
