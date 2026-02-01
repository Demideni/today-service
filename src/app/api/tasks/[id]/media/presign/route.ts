import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/guards";
import { presignUpload } from "@/lib/s3";
import { z, ZodError } from "zod";
import { randomUUID } from "crypto";

const Schema = z.object({
  kind: z.enum(["BEFORE","AFTER","EXTRA"]),
  contentType: z.string().min(3),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const s = requireRole(["OWNER","MANAGER","MECHANIC"]);
    const { kind, contentType } = Schema.parse(await req.json());

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: { workOrder: true },
    });
    if (!task || task.workOrder.organizationId !== s.orgId)
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const key = `org/${s.orgId}/task/${task.id}/${kind.toLowerCase()}-${randomUUID()}`;
    const { url, publicUrl } = await presignUpload(key, contentType);

    return NextResponse.json({ uploadUrl: url, publicUrl });
  } catch (e: any) {
    const msg = e?.message || "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
    if (e instanceof ZodError) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    // if S3 env missing:
    if (msg.includes("S3_")) return NextResponse.json({ error: "S3_NOT_CONFIGURED" }, { status: 500 });
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
