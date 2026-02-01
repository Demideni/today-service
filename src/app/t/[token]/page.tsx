import { prisma } from "@/lib/prisma";

const statusText: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "Work started",
  waiting_parts: "Waiting for parts",
  ready: "Ready",
};

export default async function TrackPage({ params }: { params: { token: string } }) {
  const wo = await prisma.workOrder.findUnique({
    where: { publicToken: params.token },
    include: {
      client: true,
      vehicle: true,
      tasks: { include: { media: true } },
    },
  });

  if (!wo) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-md mx-auto bg-white border rounded-2xl p-4">
          Link invalid
        </div>
      </main>
    );
  }

  const statusLabel = statusText[wo.statusLabel] ?? wo.statusLabel;

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-md mx-auto space-y-4 pb-10">
        <header className="bg-white border rounded-2xl p-4">
          <div className="text-lg font-semibold">Service progress</div>
          <div className="mt-2 text-sm opacity-80">
            {wo.vehicle.make} {wo.vehicle.model} {wo.vehicle.year ?? ""}
          </div>
          <div className="mt-2 text-sm">
            Status: <span className="font-medium">{statusLabel}</span>
          </div>
        </header>

        <section className="bg-white border rounded-2xl p-4">
          <div className="text-sm font-medium">Tasks</div>
          <div className="mt-3 space-y-3">
            {wo.tasks.map((t) => {
              const before = t.media.filter((m) => m.kind === "BEFORE");
              const after = t.media.filter((m) => m.kind === "AFTER");
              return (
                <div key={t.id} className="border rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm">{t.title}</div>
                    <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{t.status}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs font-medium opacity-80">Before</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {before.slice(0, 2).map((m) => (
                          <img key={m.id} src={m.url} alt="before" className="w-full h-24 object-cover rounded-xl border" />
                        ))}
                        {before.length === 0 && <div className="text-xs opacity-70">No photos yet</div>}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium opacity-80">After</div>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {after.slice(0, 2).map((m) => (
                          <img key={m.id} src={m.url} alt="after" className="w-full h-24 object-cover rounded-xl border" />
                        ))}
                        {after.length === 0 && <div className="text-xs opacity-70">No photos yet</div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {wo.tasks.length === 0 && <div className="text-sm opacity-70">No tasks</div>}
          </div>
        </section>

        <footer className="text-xs opacity-60 text-center">
          Powered by AutoService
        </footer>
      </div>
    </main>
  );
}
