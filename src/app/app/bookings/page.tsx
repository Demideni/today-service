import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function BookingsPage() {
  const s = getSession();
  if (!s) return null;

  if (s.role === "MECHANIC") {
    return (
      <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
        Bookings are available for managers.
      </div>
    );
  }

  const bookings = await prisma.bookingRequest.findMany({
    where: { organizationId: s.orgId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const org = await prisma.organization.findUnique({ where: { id: s.orgId } });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Bookings</h1>
        <p className="text-sm opacity-70">
          Public booking link: <a className="underline" href={`/book/${org?.slug}`} target="_blank" rel="noreferrer">/book/{org?.slug}</a>
        </p>
      </div>

      {bookings.length === 0 && (
        <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
          No booking requests yet.
        </div>
      )}

      <div className="space-y-3">
        {bookings.map((b) => (
          <section key={b.id} className="bg-white border rounded-2xl p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{b.clientName}</div>
                <div className="text-sm opacity-80">{b.serviceType}</div>
                <div className="text-xs opacity-70 mt-1">
                  {b.vehicleMake || ""} {b.vehicleModel || ""} {b.vehicleYear ? `(${b.vehicleYear})` : ""}
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{b.status}</span>
            </div>

            <div className="mt-2 text-sm">
              {b.phone && <div>📞 {b.phone}</div>}
              {b.email && <div>✉️ {b.email}</div>}
              {b.preferredDate && <div>🗓️ {b.preferredDate}</div>}
            </div>

            {b.notes && <div className="mt-2 text-sm whitespace-pre-wrap opacity-80">{b.notes}</div>}

            <div className="mt-2 text-xs opacity-60">{new Date(b.createdAt).toLocaleString()}</div>
          </section>
        ))}
      </div>
    </div>
  );
}
