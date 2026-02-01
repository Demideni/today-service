import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: { id: string } }) {
  const item = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!item) return <div className="p-6">Not found</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4">
      <div className="max-w-3xl mx-auto space-y-3">
        <a href="/market" className="text-sm underline opacity-70">← Back</a>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold">{item.title}</h1>
              <div className="text-xs opacity-70 mt-1">{item.location || "—"} • {new Date(item.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-lg font-semibold">{item.price ? `$${item.price}` : "—"}</div>
          </div>

          {item.description && <div className="mt-3 whitespace-pre-wrap text-sm opacity-90">{item.description}</div>}

          <div className="mt-4 border-t pt-3">
            <div className="text-sm font-medium">Contact</div>
            <div className="text-sm opacity-80 mt-1">
              {item.sellerName}
              {item.sellerPhone ? <div>📞 {item.sellerPhone}</div> : null}
              {item.sellerEmail ? <div>✉️ {item.sellerEmail}</div> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
