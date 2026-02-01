import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z } from "zod";

const Schema = z.object({
  token: z.string().min(10),
  name: z.string().min(2).optional(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const data = Schema.parse(await req.json());

  const invite = await prisma.invite.findUnique({ where: { token: data.token } });
  if (!invite) return NextResponse.json({ error: "INVITE_NOT_FOUND" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "INVITE_USED" }, { status: 409 });
  if (invite.expiresAt.getTime() < Date.now()) return NextResponse.json({ error: "INVITE_EXPIRED" }, { status: 410 });

  const email = invite.email.toLowerCase();
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    user = await prisma.user.create({ data: { email, passwordHash, name: data.name } });
  }

  await prisma.membership.create({
    data: { userId: user.id, organizationId: invite.organizationId, role: invite.role },
  });

  await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });

  const token = signSession({ userId: user.id, orgId: invite.organizationId, role: invite.role });
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
