import { prisma } from "@/lib/db";
import AssignmentsClient from "./AssignmentsClient";
import { getFirmId } from "@/lib/auth-utils";

export default async function AssignmentsPage() {
  const firmId = await getFirmId();
  if (!firmId) return null;

  const [assignments, clients, users, activityLogs] = await Promise.all([
    prisma.assignment.findMany({
      where: { firmId },
      include: {
        client: true,
        user: true,
      },
      orderBy: { deadline: "asc" }
    }),
    prisma.client.findMany({ where: { firmId }, orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { firmId }, orderBy: { name: "asc" } }),
    prisma.activityLog.findMany({
      where: { firmId, entityType: "ASSIGNMENT" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: true }
    }),
  ]);

  return <AssignmentsClient initialAssignments={assignments} clients={clients} users={users} initialLogs={activityLogs} />;
}
