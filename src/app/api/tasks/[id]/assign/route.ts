import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { z } from "zod";

const Schema = z.object({
  assignedToId: z.string().nullable(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const s = requireRole(["OWNER", "MANAGER"]);
    const { assignedToId } = Schema.parse(await req.json());

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { workOrder: true },
    });
    if (!task || task.workOrder.organizationId !== s.orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { assignedToId: assignedToId ?? null },
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    const msg = e?.message || "Server error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    // zod error
    if (e?.issues) return NextResponse.json({ error: e.issues?.[0]?.message || "INVALID" }, { status: 400 });
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
