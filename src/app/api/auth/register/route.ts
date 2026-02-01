import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signSession, setSessionCookie } from "@/lib/auth";
import { z, ZodError } from "zod";
import { randomUUID } from "crypto";


function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50) || "service";
}

async function uniqueOrgSlug(base: string) {
  let slug = base;
  for (let i = 0; i < 20; i++) {
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${Math.floor(Math.random() * 9999)}`;
  }
  return `${base}-${Math.floor(Math.random() * 999999)}`;
}


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

    // `name` is optional in the request schema but required in the DB.
    const safeName = (data.name ?? data.email.split("@")[0] ?? "User").slice(0, 80);

    const user = await prisma.user.create({
      data: { email: data.email, passwordHash, name: safeName },
    });

    const org = await prisma.organization.create({
      data: { name: data.orgName },
    });

    await prisma.membership.create({
      data: { userId: user.id, organizationId: org.id, role: "OWNER" },
    });


    // seed knowledge base templates (global)
    const existingTemplates = await prisma.workTemplate.count();
    if (existingTemplates === 0) {
      await prisma.workTemplate.create({
        data: {
          title: "Brake pads + rotor replacement (front)",
          category: "BRAKES",
          description: "Standard front brake service: pads + rotor.",
          vehicleHint: "Most trucks/SUVs",
          steps: {
            create: [
              { order: 1, title: "Safety + lift", tools: "Floor jack, jack stands, wheel chocks", details: "Chock wheels, lift at proper points, support on stands." },
              { order: 2, title: "Remove wheel", tools: "Impact or breaker bar, socket (commonly 19–22mm)", details: "Break lug nuts loose, remove wheel." },
              { order: 3, title: "Remove caliper + bracket", tools: "Ratchet, sockets (commonly 13–21mm)", details: "Unbolt caliper, hang with hook. Remove bracket if needed." },
              { order: 4, title: "Remove rotor", tools: "Rubber mallet, penetrant", details: "Remove retaining screw (if present). Tap rotor off hub; clean hub face." },
              { order: 5, title: "Install new rotor", tools: "Wire brush, brake cleaner", details: "Clean rotor, install, ensure flush to hub." },
              { order: 6, title: "Install pads", tools: "C-clamp / piston tool, brake grease", details: "Compress piston, install pads, grease contact points." },
              { order: 7, title: "Reassemble + torque", tools: "Torque wrench", details: "Torque bracket/caliper bolts to spec; reinstall wheel; torque lug nuts." },
              { order: 8, title: "Bed-in + test", tools: "Road test checklist", details: "Pump pedal, check for leaks/noise; perform bedding procedure if required." },
            ],
          },
        },
      });

      await prisma.workTemplate.create({
        data: {
          title: "Oil change (gasoline engine)",
          category: "OIL_SERVICE",
          description: "Engine oil + filter service.",
          vehicleHint: "Most cars/trucks",
          steps: {
            create: [
              { order: 1, title: "Prepare", tools: "Oil drain pan, gloves, filter wrench", details: "Warm engine briefly, secure vehicle." },
              { order: 2, title: "Drain oil", tools: "Socket/wrench for drain plug", details: "Remove drain plug, drain fully, replace crush washer if needed." },
              { order: 3, title: "Replace filter", tools: "Filter wrench", details: "Remove old filter, lube gasket on new filter, install hand-tight." },
              { order: 4, title: "Refill", tools: "Funnel", details: "Install drain plug (torque to spec), refill with correct oil amount/grade." },
              { order: 5, title: "Start + check", tools: "Shop towel", details: "Start engine, check leaks, verify level after a minute." },
              { order: 6, title: "Sticker/reset", tools: "Service reset procedure", details: "Reset oil life monitor if applicable." },
            ],
          },
        },
      });
    }


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
        organizationId: org.id,
        workOrderId: wo.id,
        title: "Replace rotor (front left)",
        description: "Use checklist steps. Request photos before and after.",
        statusLabel: "assigned",
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
