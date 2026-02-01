import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { z } from "zod";

const Schema = z.object({
  membershipId: z.string().min(10),
  role: z.enum(["OWNER", "MANAGER", "MECHANIC"]),
});

export async function POST(req: Request) {
  const s = requireRole(["OWNER"]);
  const data = Schema.parse(await req.json());

  const m = await prisma.membership.findUnique({ where: { id: data.membershipId } });
  if (!m || m.organizationId !== s.orgId) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // prevent removing last owner
  if (m.role === "OWNER" && data.role !== "OWNER") {
    const owners = await prisma.membership.count({ where: { organizationId: s.orgId, role: "OWNER" } });
    if (owners <= 1) return NextResponse.json({ error: "LAST_OWNER" }, { status: 409 });
  }

  const updated = await prisma.membership.update({ where: { id: data.membershipId }, data: { role: data.role } });
  return NextResponse.json({ ok: true, membership: updated });
}
