import { prisma } from "@/lib/db";
import AssignmentsClient from "./AssignmentsClient";

export default async function AssignmentsPage() {
  const assignments = await prisma.assignment.findMany({
    include: {
      client: true,
      user: true,
    },
    orderBy: { deadline: "asc" }
  });

  return <AssignmentsClient initialAssignments={assignments} />;
}
