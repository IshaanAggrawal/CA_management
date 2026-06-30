"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function updateAssignmentStatus(id: string, newStatus: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  await prisma.assignment.update({
    where: { id },
    data: { status: newStatus }
  });

  revalidatePath("/dashboard/assignments");
  revalidatePath("/dashboard");
}

export async function exportAssignmentsCSV() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const assignments = await prisma.assignment.findMany({
    include: { client: true, user: true },
    orderBy: { deadline: "asc" }
  });

  const headers = "ID,Task,Client,Assignee,Status,Priority,Deadline\n";
  const rows = assignments.map((a: any) => 
    `${a.id},"${a.title}","${a.client.name}","${a.user?.name || "Unassigned"}","${a.status}","${a.priority}","${a.deadline?.toISOString() || ""}"`
  ).join("\n");

  return headers + rows;
}
