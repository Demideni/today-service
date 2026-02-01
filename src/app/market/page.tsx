import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MarketPage() {
  const items = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Marketplace</h1>
            <p className="text-sm opacity-70">Sell your car or equipment. Simple board.</p>
          </div>
          <a href="/market/new" className="h-12 px-4 rounded-xl bg-slate-900 text-white font-medium inline-flex items-center">
            + Post
          </a>
        </div>

        {items.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 text-sm opacity-80">
            No listings yet.
          </div>
        )}

        <div className="grid gap-3">
          {items.map((i) => (
            <a key={i.id} href={`/market/${i.id}`} className="bg-white border rounded-2xl p-4 hover:shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{i.title}</div>
                  <div className="text-xs opacity-70 mt-1">{i.location || "—"} • {new Date(i.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold">{i.price ? `$${i.price}` : "—"}</div>
              </div>
              {i.description && <div className="mt-2 text-sm opacity-80 line-clamp-2">{i.description}</div>}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
