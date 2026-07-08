import { prisma } from "@/lib/db";
import SupportClient from "./SupportClient";
import { auth } from "@clerk/nextjs/server";

export default async function SupportPage() {
  const { userId } = await auth();

  // Fetch recent tickets for the user, or just globally if they are admin.
  // For now, let's fetch tickets for this user, or all if we want to show global history.
  // We'll just fetch their tickets. If no userId, fetch nothing.
  
  const tickets = userId ? await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      updatedAt: true,
    }
  }) : [];

  return <SupportClient initialTickets={tickets} />;
}
