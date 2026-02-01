import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export default async function TeamPage() {
  const s = getSession();
  if (!s) return null;

  if (s.role === "MECHANIC") {
    return (
      <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
        Team management is available for managers.
      </div>
    );
  }

  const members = await prisma.membership.findMany({
    where: { organizationId: s.orgId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Team</h1>
      <section className="bg-white border rounded-2xl overflow-hidden">
        {members.map((m) => (
          <div key={m.id} className="p-4 border-b last:border-b-0 flex items-center justify-between">
            <div>
              <div className="font-medium">{m.user.name ?? m.user.email}</div>
              <div className="text-xs opacity-70">{m.user.email}</div>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-slate-100">{m.role}</div>
          </div>
        ))}
      </section>

      <div className="bg-white border rounded-2xl p-4 text-sm opacity-80">
        Next: add invites (email link) + role editor.
      </div>
    </div>
  );
}
