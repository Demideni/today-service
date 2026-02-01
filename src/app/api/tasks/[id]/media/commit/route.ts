import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { z, ZodError } from "zod";

const Schema = z.object({
  kind: z.enum(["BEFORE","AFTER","EXTRA"]),
  url: z.string().url(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const s = requireRole(["OWNER","MANAGER","MECHANIC"]);
    const { kind, url } = Schema.parse(await req.json());

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { workOrder: true },
    });
    if (!task || task.workOrder.organizationId !== s.orgId)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const item = await prisma.media.create({
      data: { taskId: task.id, kind, url, createdById: s.userId },
    });

    return NextResponse.json({ item });
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (e instanceof ZodError) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
