import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import TaskControls from "../components/TaskControls";
import StepChecklist from "../components/StepChecklist";
import Uploader from "../components/Uploader";
import TaskChat from "../components/TaskChat";

function badgeFor(status: string) {
  switch (status) {
    case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
    case "WAITING_PARTS": return "bg-amber-100 text-amber-800";
    case "DONE": return "bg-green-100 text-green-700";
    default: return "bg-slate-100 text-slate-700";
  }
}

export default async function MyTasksPage() {
  const s = getSession();
  if (!s) return null;

  const tasks = await prisma.task.findMany({
    where: {
      assignedToId: s.userId,
      workOrder: { organizationId: s.orgId },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      steps: true,
      media: true,
      workOrder: { include: { client: true, vehicle: true } },
    },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">My tasks</h1>
        <p className="text-sm opacity-70">Only tasks assigned to you</p>
      </div>

      {tasks.length === 0 && (
        <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
          No tasks assigned yet.
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((t) => {
          const before = t.media.filter((m) => m.kind === "BEFORE").length;
          const after = t.media.filter((m) => m.kind === "AFTER").length;
          const stepsDone = t.steps.filter((st) => st.done).length;

          return (
            <section key={t.id} className="bg-white border rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-sm opacity-80">
                    {t.workOrder.client.name} • {t.workOrder.vehicle.make} {t.workOrder.vehicle.model} {t.workOrder.vehicle.year ?? ""}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={["px-2 py-1 rounded-full", badgeFor(t.status)].join(" ")}>
                      {t.status}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-slate-100">
                      Steps {stepsDone}/{t.steps.length}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-slate-100">
                      Photos {before} / {after}
                    </span>
                    <a className="underline" href={`/t/${t.workOrder.publicToken}`} target="_blank" rel="noreferrer">
                      Client view
                    </a>
                  </div>
                </div>
              </div>

              <TaskControls taskId={t.id} />

              <div className="grid md:grid-cols-2 gap-4">
                <StepChecklist steps={t.steps} />
                <div className="space-y-2">
                  <div className="text-xs opacity-70">Photos</div>
                  <Uploader taskId={t.id} kind="BEFORE" />
                  <Uploader taskId={t.id} kind="AFTER" />
                </div>
              </div>

              <TaskChat taskId={t.id} />
            </section>
          );
        })}
      </div>
    </div>
  );
}
