import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

type DashboardDeadlineRecord = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | null;
  client: { name: string | null } | null;
};

export default async function DashboardPage() {
  const recentAssignments = await prisma.assignment.findMany({
    include: { client: true, user: true },
    orderBy: { id: "desc" },
    take: 5
  });

  const allAssignments = await prisma.assignment.findMany({
    select: {
      id: true,
      title: true,
      status: true,
      priority: true,
      deadline: true,
      createdAt: true,
    }
  });

  const upcomingDeadlines = await prisma.assignment.findMany({
    where: {
      deadline: {
        gte: new Date(),
        lte: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    },
    include: { client: true },
    orderBy: { deadline: "asc" }
  }) as DashboardDeadlineRecord[];

  const normalizedUpcomingDeadlines = upcomingDeadlines
    .filter((assignment) => assignment.deadline !== null)
    .map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      priority: assignment.priority,
      deadline: assignment.deadline!,
      client: assignment.client ? { name: assignment.client.name } : null,
    }));

  const totalAssignments = await prisma.assignment.count();
  const activeAssignments = await prisma.assignment.count({
    where: { status: { not: "COMPLETED" } }
  });

  return (
    <DashboardClient 
      recentAssignments={recentAssignments} 
      upcomingDeadlines={normalizedUpcomingDeadlines}
      allAssignments={allAssignments}
      metrics={{ totalAssignments, activeAssignments }}
    />
  );
}
