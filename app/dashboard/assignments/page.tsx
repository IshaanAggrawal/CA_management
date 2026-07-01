import { prisma } from "@/lib/db";
import AssignmentsClient from "./AssignmentsClient";

export default async function AssignmentsPage() {
  const [assignments, clients, users] = await Promise.all([
    prisma.assignment.findMany({
      include: {
        client: true,
        user: true,
      },
      orderBy: { deadline: "asc" }
    }),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <AssignmentsClient initialAssignments={assignments} clients={clients} users={users} />;
}
