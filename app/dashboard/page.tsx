import { prisma } from "@/lib/db";
import DashboardClient from "./DashboardClient";

import { getFirmId } from "@/lib/auth-utils";

type DashboardDeadlineRecord = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  deadline: Date | null;
  client: { name: string | null } | null;
};

export default async function DashboardPage() {
  const firmId = await getFirmId();
  if (!firmId) return null; // Let middleware or layout handle redirect

  const recentAssignments = await prisma.assignment.findMany({
    where: { firmId },
    include: { client: true, user: true },
    orderBy: { id: "desc" },
    take: 5
  });

  const allAssignments = await prisma.assignment.findMany({
    where: { firmId },
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
      firmId,
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

  const totalAssignments = await prisma.assignment.count({ where: { firmId } });
  const activeAssignments = await prisma.assignment.count({
    where: { firmId, status: { not: "COMPLETED" } }
  });

  // NEW METRICS

  // Staff Workload
  const staffWorkloadRaw = await prisma.assignment.groupBy({
    by: ['userId'],
    _count: { id: true },
    where: { firmId, status: { not: "COMPLETED" }, userId: { not: null } }
  });
  
  // Need to get names for the userIds
  const users = await prisma.user.findMany({
    where: { id: { in: staffWorkloadRaw.map(s => s.userId as string) } },
    select: { id: true, name: true }
  });
  const staffWorkload = staffWorkloadRaw.map(s => ({
    name: users.find(u => u.id === s.userId)?.name || "Unknown",
    activeAssignments: s._count.id
  }));

  // Billing and Growth
  const allInvoices = await prisma.invoice.findMany({
    where: { firmId },
    select: { amount: true, createdAt: true, status: true }
  });
  
  const toAmountNumber = (amount: any) => typeof amount === "number" ? amount : amount.toNumber();
  const totalBilling = allInvoices.reduce((sum, inv) => sum + toAmountNumber(inv.amount), 0);
  
  const now = new Date();
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const billingThisMonth = allInvoices
    .filter(inv => inv.createdAt >= currentMonthStart)
    .reduce((sum, inv) => sum + toAmountNumber(inv.amount), 0);
    
  const billingLastMonth = allInvoices
    .filter(inv => inv.createdAt >= previousMonthStart && inv.createdAt < currentMonthStart)
    .reduce((sum, inv) => sum + toAmountNumber(inv.amount), 0);

  const newClientsThisMonth = await prisma.client.count({
    where: { firmId, createdAt: { gte: currentMonthStart } }
  });
  const newClientsLastMonth = await prisma.client.count({
    where: { firmId, createdAt: { gte: previousMonthStart, lt: currentMonthStart } }
  });

  return (
    <DashboardClient 
      recentAssignments={recentAssignments} 
      upcomingDeadlines={normalizedUpcomingDeadlines}
      allAssignments={allAssignments}
      metrics={{ totalAssignments, activeAssignments }}
      billing={{ totalBilling, billingThisMonth, billingLastMonth }}
      growth={{ newClientsThisMonth, newClientsLastMonth }}
      staffWorkload={staffWorkload}
    />
  );
}
