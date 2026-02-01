import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "as_session";

export type SessionPayload = {
  userId: string;
  orgId: string;
  role: "OWNER" | "MANAGER" | "MECHANIC";
};

export function signSession(payload: SessionPayload) {
  const secret = process.env.JWT_SECRET!;
  return jwt.sign(payload, secret, { expiresIn: "14d" });
}

export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getSession(): SessionPayload | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, secret) as SessionPayload;
  } catch {
    return null;
  }
}
