import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import TeamClient from "./TeamClient";

export default async function TeamPage() {
  const s = getSession();
  if (!s) return null;

  const members = await prisma.membership.findMany({
    where: { organizationId: s.orgId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  const canInvite = s.role === "OWNER" || s.role === "MANAGER";
  const canEditRoles = s.role === "OWNER";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Team</h1>
        <div className="text-sm opacity-70">Invite staff, manage roles.</div>
      </div>

      <TeamClient members={members as any} canInvite={canInvite} canEditRoles={canEditRoles} />

      <div className="text-xs opacity-60">
        Tip: set <code>PUBLIC_BASE_URL</code> in Render (e.g. https://today-service.com) so invite links use your domain.
      </div>
    </div>
  );
}
