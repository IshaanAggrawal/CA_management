"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

type AssignmentStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH";

const ASSIGNMENT_STATUSES: AssignmentStatus[] = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];
const ASSIGNMENT_PRIORITIES: AssignmentPriority[] = ["LOW", "MEDIUM", "HIGH"];

const getStringField = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const normalizeOptional = (value: string) => (value.length > 0 ? value : null);

export async function createAssignment(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const title = getStringField(formData, "title");
  const description = getStringField(formData, "description");
  const clientId = getStringField(formData, "clientId");
  const userId = getStringField(formData, "userId");
  const statusRaw = getStringField(formData, "status").toUpperCase() as AssignmentStatus;
  const priorityRaw = getStringField(formData, "priority").toUpperCase() as AssignmentPriority;
  const deadlineRaw = getStringField(formData, "deadline");

  if (!title) throw new Error("Title is required");
  if (!clientId) throw new Error("Client is required");

  const status = ASSIGNMENT_STATUSES.includes(statusRaw) ? statusRaw : "TODO";
  const priority = ASSIGNMENT_PRIORITIES.includes(priorityRaw) ? priorityRaw : "MEDIUM";
  const deadline = deadlineRaw ? new Date(deadlineRaw) : null;

  if (deadline && Number.isNaN(deadline.getTime())) {
    throw new Error("Deadline is invalid");
  }

  const assignment = await prisma.assignment.create({
    data: {
      title,
      description: normalizeOptional(description),
      status,
      priority,
      deadline,
      clientId,
      userId: normalizeOptional(userId),
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CREATED",
      entityType: "ASSIGNMENT",
      entityId: assignment.id,
      details: `Created assignment "${title}"`,
      userId: user.id
    }
  });

  revalidatePath("/dashboard/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
}

export async function updateAssignmentStatus(id: string, newStatus: AssignmentStatus) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  if (!ASSIGNMENT_STATUSES.includes(newStatus)) {
    throw new Error("Invalid assignment status");
  }

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) throw new Error("Assignment not found");

  const oldStatus = assignment.status;

  await prisma.assignment.update({
    where: { id },
    data: { status: newStatus }
  });

  await prisma.activityLog.create({
    data: {
      action: "UPDATED",
      entityType: "ASSIGNMENT",
      entityId: id,
      details: `Status changed from ${oldStatus.replace("_", " ")} to ${newStatus.replace("_", " ")}`,
      userId: user.id
    }
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
  const rows = assignments.map((assignment) => {
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [
      assignment.id,
      escapeCsv(assignment.title),
      escapeCsv(assignment.client.name),
      escapeCsv(assignment.user?.name || "Unassigned"),
      escapeCsv(assignment.status),
      escapeCsv(assignment.priority),
      escapeCsv(assignment.deadline?.toISOString() || ""),
    ].join(",");
  }).join("\n");

  return headers + rows;
}

export async function deleteAssignment(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  
  if (assignment) {
    await prisma.assignment.delete({
      where: { id },
    });

    await prisma.activityLog.create({
      data: {
        action: "DELETED",
        entityType: "ASSIGNMENT",
        entityId: id,
        details: `Deleted assignment "${assignment.title}"`,
        userId: user.id
      }
    });
  }

  revalidatePath("/dashboard/assignments");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
}
