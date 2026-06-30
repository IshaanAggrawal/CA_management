import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const recentAssignments = await prisma.assignment.findMany({
    include: { client: true, user: true },
    orderBy: { id: "desc" },
    take: 5
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
  });

  const totalAssignments = await prisma.assignment.count();
  const activeAssignments = await prisma.assignment.count({
    where: { status: { not: "COMPLETED" } }
  });

  return (
    <DashboardClient 
      recentAssignments={recentAssignments} 
      upcomingDeadlines={upcomingDeadlines}
      metrics={{ totalAssignments, activeAssignments }}
    />
  );
}
