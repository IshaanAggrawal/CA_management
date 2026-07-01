import { prisma } from "@/lib/db";
import CalendarClient from "./CalendarClient";

type CalendarAssignmentRecord = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  deadline: Date | null;
  client: { name: string | null } | null;
};

export default async function CalendarPage() {
  const assignments = (await prisma.assignment.findMany({
    where: {
      deadline: {
        not: null
      }
    },
    include: { client: true, user: true },
    orderBy: { deadline: "asc" }
  })) as CalendarAssignmentRecord[];

  const normalizedAssignments = assignments
    .filter((assignment) => assignment.deadline !== null)
    .map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      priority: assignment.priority,
      status: assignment.status,
      deadline: assignment.deadline!,
      client: assignment.client ? { name: assignment.client.name } : null,
    }));

  return <CalendarClient assignments={normalizedAssignments} />;
}
