import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/guards";

export async function GET() {
  const s = requireSession();
  const items = await prisma.workOrder.findMany({
    where: { organizationId: s.orgId },
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      vehicle: true,
      tasks: true,
    },
    take: 50,
  });
  return NextResponse.json({ items });
}
