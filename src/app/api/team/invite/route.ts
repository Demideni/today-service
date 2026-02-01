import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { z } from "zod";
import { randomUUID } from "crypto";

const Schema = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "MANAGER", "MECHANIC"]).default("MECHANIC"),
});

export async function POST(req: Request) {
  const s = requireRole(["OWNER", "MANAGER"]);
  const data = Schema.parse(await req.json());

  // prevent inviting existing member
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    const existingMember = await prisma.membership.findUnique({
      where: { userId_organizationId: { userId: existingUser.id, organizationId: s.orgId } },
    });
    if (existingMember) return NextResponse.json({ error: "ALREADY_MEMBER" }, { status: 409 });
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  const invite = await prisma.invite.create({
    data: {
      organizationId: s.orgId,
      email: data.email.toLowerCase(),
      role: data.role,
      token,
      expiresAt,
      createdById: s.userId,
    },
  });

  const baseUrl = process.env.PUBLIC_BASE_URL || "";
  const url = `${baseUrl}/invite/${invite.token}`;

  return NextResponse.json({ ok: true, invite: { id: invite.id, email: invite.email, role: invite.role, expiresAt: invite.expiresAt, url } });
}
