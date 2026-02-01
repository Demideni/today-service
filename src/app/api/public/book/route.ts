import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Schema = z.object({
  orgSlug: z.string().min(1),
  clientName: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().int().optional(),
  serviceType: z.string().min(2),
  preferredDate: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const data = Schema.parse(await req.json());

  const org = await prisma.organization.findUnique({ where: { slug: data.orgSlug } });
  if (!org) return NextResponse.json({ error: "ORG_NOT_FOUND" }, { status: 404 });

  await prisma.bookingRequest.create({
    data: {
      organizationId: org.id,
      clientName: data.clientName,
      phone: data.phone || null,
      email: data.email ? data.email : null,
      vehicleMake: data.vehicleMake || null,
      vehicleModel: data.vehicleModel || null,
      vehicleYear: data.vehicleYear || null,
      serviceType: data.serviceType,
      preferredDate: data.preferredDate || null,
      notes: data.notes || null,
    },
  });

  return NextResponse.json({ ok: true });
}
