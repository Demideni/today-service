"use client";

import { usePathname } from "next/navigation";

type Role = "OWNER" | "MANAGER" | "MECHANIC";

function Icon({ name, active }: { name: "home" | "tasks" | "book" | "knowledge" | "team" | "settings"; active: boolean }) {
  const cls = active ? "stroke-blue-600" : "stroke-slate-500";
  const common = `w-6 h-6 ${cls}`;
  const strokeProps = { stroke: "currentColor" as const, strokeWidth: 2, fill: "none" as const };
  switch (name) {
    case "home":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      );
    case "tasks":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M9 6h12" />
          <path d="M9 12h12" />
          <path d="M9 18h12" />
          <path d="M3 6l1 1 2-2" />
          <path d="M3 12l1 1 2-2" />
          <path d="M3 18l1 1 2-2" />
        </svg>
      );
    case "book":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M6 2h12v20H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
          <path d="M6 2v20" />
          <path d="M10 6h6" />
          <path d="M10 10h6" />
        </svg>
      );
    case "knowledge":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5V4.5A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 6h8" />
          <path d="M8 10h8" />
        </svg>
      );
    case "team":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "settings":
      return (
        <svg className={common} viewBox="0 0 24 24" {...strokeProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a7.6 7.6 0 0 0 .1-1 7.6 7.6 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.7-1L14.9 2h-5.8L8.7 5.0a8 8 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.6 7.6 0 0 0-.1 1c0 .34.03.67.1 1l-2 1.5 2 3.5 2.4-1c.53.4 1.1.74 1.7 1l.4 2.5h5.8l.4-2.5c.6-.26 1.17-.6 1.7-1l2.4 1 2-3.5-2-1.5Z" />
        </svg>
      );
  }
}

function Tab({ href, label, icon, active }: { href: string; label: string; icon: any; active: boolean }) {
  return (
    <a
      href={href}
      className={[
        "flex-1 flex flex-col items-center justify-center gap-1",
        "py-3",
        active ? "text-blue-600" : "text-slate-600",
      ].join(" ")}
    >
      <Icon name={icon} active={active} />
      <span className="text-[11px] font-medium">{label}</span>
    </a>
  );
}

export default function BottomNav({ role }: { role: Role }) {
  const p = usePathname();
  const is = (href: string) => p === href || (href !== "/app" && p?.startsWith(href + "/"));

  const showBookings = role === "OWNER" || role === "MANAGER";
  const showTeam = role === "OWNER" || role === "MANAGER";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-5xl px-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        <div className="bg-white/95 backdrop-blur border rounded-2xl shadow-sm flex overflow-hidden">
          <Tab href="/app" label="Home" icon="home" active={is("/app")} />
          <Tab href="/app/tasks" label="Tasks" icon="tasks" active={is("/app/tasks")} />
          <Tab
            href={showBookings ? "/app/bookings" : "/app/settings"}
            label={showBookings ? "Bookings" : "Settings"}
            icon={showBookings ? "book" : "settings"}
            active={showBookings ? is("/app/bookings") : is("/app/settings")}
          />
          <Tab href="/app/knowledge" label="Guide" icon="knowledge" active={is("/app/knowledge")} />
          <Tab
            href={showTeam ? "/app/team" : "/app/settings"}
            label={showTeam ? "Team" : "Settings"}
            icon={showTeam ? "team" : "settings"}
            active={showTeam ? is("/app/team") : is("/app/settings")}
          />
        </div>
      </div>
    </nav>
  );
}
