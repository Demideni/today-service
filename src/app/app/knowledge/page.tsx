import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const catLabel: Record<string, string> = {
  BRAKES: "Brakes",
  OIL_SERVICE: "Oil service",
  SUSPENSION: "Suspension",
  DIAGNOSTICS: "Diagnostics",
  ENGINE: "Engine",
  TRANSMISSION: "Transmission",
  TIRES: "Tires",
  OTHER: "Other",
};

export default async function KnowledgePage() {
  const s = getSession();
  if (!s) return null;

  const templates = await prisma.workTemplate.findMany({
    orderBy: [{ category: "asc" }, { title: "asc" }],
    include: { steps: { orderBy: { order: "asc" } } },
    take: 200,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Mechanic knowledge base</h1>
        <p className="text-sm opacity-70">Quick checklists: tools + steps for common work.</p>
      </div>

      {templates.length === 0 && (
        <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
          No templates yet. (They are auto-seeded on the first registration.)
        </div>
      )}

      <div className="space-y-3">
        {templates.map((t) => (
          <details key={t.id} className="bg-white border rounded-2xl p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-xs opacity-70">{catLabel[t.category] ?? t.category}{t.vehicleHint ? ` • ${t.vehicleHint}` : ""}</div>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{t.steps.length} steps</span>
              </div>
              {t.description && <div className="mt-2 text-sm opacity-80">{t.description}</div>}
            </summary>

            <div className="mt-3 space-y-2">
              {t.steps.map((s) => (
                <div key={s.id} className="border rounded-xl p-3">
                  <div className="text-sm font-medium">{s.order}. {s.title}</div>
                  {s.tools && <div className="text-xs opacity-70 mt-1">Tools: {s.tools}</div>}
                  {s.details && <div className="text-sm opacity-80 mt-1 whitespace-pre-wrap">{s.details}</div>}
                </div>
              ))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
