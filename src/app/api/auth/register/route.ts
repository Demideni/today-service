import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z, ZodError } from "zod";
import { randomUUID } from "crypto";

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(2),
  name: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  try {
    const data = Schema.parse(await req.json());

    const exists = await prisma.user.findUnique({ where: { email: data.email } });
    if (exists) return NextResponse.json({ error: "EMAIL_IN_USE" }, { status: 409 });

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, name: data.name },
    });

    const org = await prisma.organization.create({
      data: { name: data.orgName },
    });

    await prisma.membership.create({
      data: { userId: user.id, organizationId: org.id, role: "OWNER" },
    });

    // demo data
    const client = await prisma.client.create({
      data: { organizationId: org.id, name: "Demo Client", phone: "+1..." },
    });
    const vehicle = await prisma.vehicle.create({
      data: { make: "Dodge", model: "Ram 3500", year: 2021 },
    });

    const wo = await prisma.workOrder.create({
      data: {
        organizationId: org.id,
        clientId: client.id,
        vehicleId: vehicle.id,
        title: "Demo: Brake rotor replace",
        publicToken: randomUUID(),
        statusLabel: "assigned",
      },
    });

    await prisma.task.create({
      data: {
        workOrderId: wo.id,
        title: "Replace rotor (front left)",
        description: "Use checklist steps. Request photos before and after.",
        status: "ASSIGNED",
        requireBefore: true,
        requireAfter: true,
        steps: {
          create: [
            { order: 1, title: "Remove wheel", tools: "Socket 21mm", details: "Jack safely, remove lug nuts." },
            { order: 2, title: "Remove caliper", tools: "Wrench set", details: "Support caliper, don't hang by hose." },
            { order: 3, title: "Replace rotor", tools: "Rubber mallet", details: "Clean hub surface before install." },
            { order: 4, title: "Torque wheel", tools: "Torque wrench", details: "Torque to spec." },
          ],
        },
      },
    });

    const token = signSession({ userId: user.id, orgId: org.id, role: "OWNER" });
    setSessionCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (e instanceof ZodError) {
      const issue = e.issues?.[0];
      const code = issue?.path?.[0] === "password" ? "PASSWORD_TOO_SHORT" : "INVALID_INPUT";
      return NextResponse.json({ error: code, detail: issue?.message }, { status: 400 });
    }
    const msg = e?.message || "";
    if (msg.includes("secretOrPrivateKey")) {
      return NextResponse.json({ error: "JWT_SECRET_MISSING" }, { status: 500 });
    }
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
