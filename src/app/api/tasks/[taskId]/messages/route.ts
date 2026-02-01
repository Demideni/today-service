import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/guards";
import { z } from "zod";

const PostSchema = z.object({
  body: z.string().min(1).max(2000),
});

export async function GET(req: Request, { params }: { params: { taskId: string } }) {
  const s = requireSession();
  const taskId = params.taskId;

  // access control: mechanics can only see their tasks
  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { workOrder: true } });
  if (!task) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (task.workOrder.organizationId !== s.orgId) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (s.role === "MECHANIC" && task.assignedToId !== s.userId) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const msgs = await prisma.taskMessage.findMany({
    where: { taskId },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return NextResponse.json({ ok: true, messages: msgs });
}

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const s = requireSession();
  const taskId = params.taskId;
  const data = PostSchema.parse(await req.json());

  const task = await prisma.task.findUnique({ where: { id: taskId }, include: { workOrder: true } });
  if (!task) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (task.workOrder.organizationId !== s.orgId) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  if (s.role === "MECHANIC" && task.assignedToId !== s.userId) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const msg = await prisma.taskMessage.create({
    data: { taskId, authorId: s.userId, body: data.body },
  });

  return NextResponse.json({ ok: true, message: msg });
}
