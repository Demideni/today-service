import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const s = requireRole(["OWNER", "MANAGER", "MECHANIC"]);

    const step = await prisma.step.findUnique({
      where: { id: params.id },
      include: { task: { include: { workOrder: true } } },
    });

    if (!step || step.task.workOrder.organizationId !== s.orgId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const nextDone = !step.done;

    const updated = await prisma.step.update({
      where: { id: step.id },
      data: {
        done: nextDone,
        doneAt: nextDone ? new Date() : null,
        doneById: nextDone ? s.userId : null,
      },
    });

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    const msg = e?.message || "Server error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
