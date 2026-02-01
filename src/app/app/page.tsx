import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import TaskControls from "./components/TaskControls";
import Uploader from "./components/Uploader";
import StepChecklist from "./components/StepChecklist";
import AssigneeSelect from "./components/AssigneeSelect";

function badgeFor(status: string) {
  switch (status) {
    case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
    case "WAITING_PARTS": return "bg-amber-100 text-amber-800";
    case "DONE": return "bg-green-100 text-green-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export default async function AppPage() {
  const s = getSession();
  if (!s) return null;

  const members = (s.role === "OWNER" || s.role === "MANAGER")
    ? await prisma.membership.findMany({
        where: { organizationId: s.orgId, role: "MECHANIC" },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const mechanicOptions = members.map((m) => ({
    id: m.userId,
    name: m.user.name ?? "",
    email: m.user.email,
  }));

  const workOrders = await prisma.workOrder.findMany({
    where: { organizationId: s.orgId },
    orderBy: { createdAt: "desc" },
    include: {
      client: true,
      vehicle: true,
      tasks: {
        include: {
          steps: true,
          media: true,
          assignedTo: true,
        },
      },
    },
    take: 20,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-sm opacity-70">Work orders and tasks</p>
        </div>
        <a className="text-sm underline" href="/app/tasks">Go to My tasks</a>
      </div>

      <div className="space-y-4">
        {workOrders.map((wo) => (
          <section key={wo.id} className="bg-white border rounded-2xl overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{wo.title}</div>
                  <div className="text-sm opacity-80">
                    {wo.client.name} • {wo.vehicle.make} {wo.vehicle.model} {wo.vehicle.year ?? ""}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-slate-100">{wo.statusLabel}</span>
                    <a className="underline" href={`/t/${wo.publicToken}`} target="_blank" rel="noreferrer">
                      Client link
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {wo.tasks.map((t) => {
                const before = t.media.filter((m) => m.kind === "BEFORE").length;
                const after = t.media.filter((m) => m.kind === "AFTER").length;
                const stepsDone = t.steps.filter((st) => st.done).length;
                const assignedName = t.assignedTo?.name || t.assignedTo?.email || "Unassigned";
                return (
                  <div key={t.id} className="border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium">{t.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className={["px-2 py-1 rounded-full", badgeFor(t.status)].join(" ")}>
                            {t.status}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100">
                            Steps {stepsDone}/{t.steps.length}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100">
                            Photos {before} before / {after} after
                          </span>
                        </div>
                        <div className="mt-2 text-xs opacity-70">Assignee: {assignedName}</div>
                      </div>
                    </div>

                    <TaskControls taskId={t.id} />

                    {(s.role === "OWNER" || s.role === "MANAGER") && (
                      <div className="space-y-1">
                        <div className="text-xs opacity-70">Assign to mechanic</div>
                        <AssigneeSelect taskId={t.id} currentId={t.assignedToId ?? null} options={mechanicOptions} />
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <StepChecklist steps={t.steps} />

                      <div className="space-y-2">
                        <div className="text-xs opacity-70">Required photos</div>
                        <div className="text-xs opacity-60">To start: upload BEFORE. To finish: upload AFTER.</div>
                        <Uploader taskId={t.id} kind="BEFORE" />
                        <Uploader taskId={t.id} kind="AFTER" />
                      </div>
                    </div>
                  </div>
                );
              })}
              {wo.tasks.length === 0 && (
                <div className="text-sm opacity-70">No tasks yet.</div>
              )}
            </div>
          </section>
        ))}

        {workOrders.length === 0 && (
          <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">No work orders yet.</div>
        )}
      </div>
    </div>
  );
}
