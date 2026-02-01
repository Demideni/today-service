import { getSession } from "./auth";

export function requireSession() {
  const s = getSession();
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export function requireRole(roles: Array<"OWNER" | "MANAGER" | "MECHANIC">) {
  const s = requireSession();
  if (!roles.includes(s.role)) throw new Error("FORBIDDEN");
  return s;
}
