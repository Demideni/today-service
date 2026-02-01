"use client";

import { usePathname } from "next/navigation";

type Role = "OWNER" | "MANAGER" | "MECHANIC";

function Item({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={[
        "flex-1 py-2 text-center text-xs font-medium",
        active ? "text-blue-600" : "text-slate-500",
      ].join(" ")}
    >
      {label}
    </a>
  );
}

export default function BottomNav({ role }: { role: Role }) {
  const p = usePathname();
  const is = (href: string) => p === href || (href !== "/app" && p?.startsWith(href + "/"));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t">
      <div className="max-w-5xl mx-auto flex">
        <Item href="/app" label="Dashboard" active={is("/app")} />
        <Item href="/app/tasks" label="My tasks" active={is("/app/tasks")} />
        {(role === "OWNER" || role === "MANAGER") && <Item href="/app/team" label="Team" active={is("/app/team")} />}
        <Item href="/app/settings" label="Settings" active={is("/app/settings")} />
      </div>
    </nav>
  );
}
