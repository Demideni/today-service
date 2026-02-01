import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { z, ZodError } from "zod";

const Schema = z.object({
  status: z.enum(["DRAFT","ASSIGNED","IN_PROGRESS","WAITING_PARTS","WAITING_APPROVAL","BLOCKED","DONE","CLOSED"]),
});

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  try {
    const s = requireRole(["OWNER","MANAGER","MECHANIC"]);
    const { status } = Schema.parse(await req.json());

    const task = await prisma.task.findUnique({
      where: { id: params.taskId },
      include: { workOrder: true, media: true },
    });
    if (!task || task.workOrder.organizationId !== s.orgId)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const beforeCount = task.media.filter(m => m.kind === "BEFORE").length;
    const afterCount  = task.media.filter(m => m.kind === "AFTER").length;

    if (status === "IN_PROGRESS" && task.requireBefore && beforeCount === 0) {
      return NextResponse.json({ error: "BEFORE_PHOTOS_REQUIRED" }, { status: 400 });
    }
    if (status === "DONE" && task.requireAfter && afterCount === 0) {
      return NextResponse.json({ error: "AFTER_PHOTOS_REQUIRED" }, { status: 400 });
    }

    const updated = await prisma.task.update({
      where: { id: task.id },
      data: { status },
    });

    const all = await prisma.task.findMany({ where: { workOrderId: task.workOrderId } });
    const doneAll = all.every(t => t.status === "DONE" || t.status === "CLOSED");
    if (doneAll) {
      await prisma.workOrder.update({ where: { id: task.workOrderId }, data: { statusLabel: "ready" } });
    } else if (status === "IN_PROGRESS") {
      await prisma.workOrder.update({ where: { id: task.workOrderId }, data: { statusLabel: "in_progress" } });
    } else if (status === "WAITING_PARTS") {
      await prisma.workOrder.update({ where: { id: task.workOrderId }, data: { statusLabel: "waiting_parts" } });
    }

    return NextResponse.json({ item: updated });
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (e instanceof ZodError) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
