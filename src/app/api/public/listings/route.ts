import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(3).max(120),
  description: z.string().max(4000).optional(),
  price: z.coerce.number().int().positive().optional(),
  sellerName: z.string().min(2).max(80),
  sellerPhone: z.string().max(50).optional(),
  sellerEmail: z.string().email().optional().or(z.literal("")),
  location: z.string().max(120).optional(),
});

export async function GET() {
  const items = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ ok: true, items });
}

export async function POST(req: Request) {
  const data = CreateSchema.parse(await req.json());
  const listing = await prisma.listing.create({
    data: {
      title: data.title,
      description: data.description || null,
      price: data.price || null,
      sellerName: data.sellerName,
      sellerPhone: data.sellerPhone || null,
      sellerEmail: data.sellerEmail ? data.sellerEmail : null,
      location: data.location || null,
    },
  });
  return NextResponse.json({ ok: true, listingId: listing.id });
}
