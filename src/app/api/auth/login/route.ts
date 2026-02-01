import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z, ZodError } from "zod";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  orgId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = Schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });
    }

    const ok = await bcrypt.compare(data.password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "INVALID_CREDENTIALS" }, { status: 401 });

    const membership = data.orgId
      ? await prisma.membership.findUnique({
          where: { userId_organizationId: { userId: user.id, organizationId: data.orgId } },
        })
      : await prisma.membership.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "asc" } });

    if (!membership) return NextResponse.json({ error: "NO_MEMBERSHIP" }, { status: 403 });

    const token = signSession({ userId: user.id, orgId: membership.organizationId, role: membership.role });
    setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof ZodError) {
      const issue = e.issues?.[0];
      return NextResponse.json({ error: "INVALID_INPUT", detail: issue?.message }, { status: 400 });
    }
    const msg = e?.message || "";
    if (msg.includes("secretOrPrivateKey")) {
      return NextResponse.json({ error: "JWT_SECRET_MISSING" }, { status: 500 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
