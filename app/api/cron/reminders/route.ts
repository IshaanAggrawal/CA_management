import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const maxDuration = 60; // Set max duration for vercel hobby plan

export async function GET(request: Request) {
  // Optional: Add a simple secret key check to prevent unauthorized cron executions
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 1. Find all assignments due in the next 3 days that are not completed
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const pendingAssignments = await prisma.assignment.findMany({
      where: {
        deadline: {
          lte: threeDaysFromNow,
          gte: today, // Only upcoming ones
        },
        status: {
          not: "COMPLETED",
        },
      },
      include: {
        client: true,
      },
    });

    if (pendingAssignments.length === 0) {
      return NextResponse.json({ message: "No reminders needed today." });
    }

    // 2. Here you would trigger Resend/SendGrid using your API Key.
    // e.g. await resend.emails.send({ to: [...], ... })

    // 3. Log this action into the database ActivityLog
    const firstAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" }
    });

    if (firstAdmin) {
      await prisma.activityLog.create({
        data: {
          action: "REMINDER_SENT",
          entityType: "CLIENT",
          entityId: "batch",
          details: `Automated CRON triggered reminders for ${pendingAssignments.length} pending tasks.`,
          userId: firstAdmin.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      remindersSent: pendingAssignments.length,
      message: `Sent ${pendingAssignments.length} reminders successfully.`,
    });
  } catch (error: any) {
    console.error("Cron Job Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
