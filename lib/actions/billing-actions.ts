"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function createInvoice(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const amountStr = formData.get("amount");
  const dueDateStr = formData.get("dueDate");
  const clientId = formData.get("clientId");

  if (typeof amountStr !== "string" || !amountStr) throw new Error("Amount is required");
  if (typeof dueDateStr !== "string" || !dueDateStr) throw new Error("Due Date is required");
  if (typeof clientId !== "string" || !clientId) throw new Error("Client is required");

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) throw new Error("Amount must be a positive number");

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) throw new Error("Invalid due date");

  const invoice = await prisma.invoice.create({
    data: {
      amount,
      dueDate,
      clientId,
      status: "PENDING",
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CREATED",
      entityType: "INVOICE",
      entityId: invoice.id,
      details: `Created invoice for amount ${amount}`,
      userId: user.id
    }
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
}

export async function deleteInvoice(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  // Basic RBAC: only ADMIN can delete
  if (user.publicMetadata?.role === "STAFF") throw new Error("Unauthorized");

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (invoice) {
    await prisma.invoice.delete({ where: { id } });
    await prisma.activityLog.create({
      data: {
        action: "DELETED",
        entityType: "INVOICE",
        entityId: id,
        details: `Deleted invoice for amount ${invoice.amount}`,
        userId: user.id
      }
    });
  }
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
}

export async function updateInvoiceStatus(id: string, status: "PENDING" | "PAID" | "OVERDUE") {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const oldInvoice = await prisma.invoice.findUnique({ where: { id } });
  if (!oldInvoice) throw new Error("Invoice not found");

  await prisma.invoice.update({
    where: { id },
    data: { status }
  });

  await prisma.activityLog.create({
    data: {
      action: "UPDATED",
      entityType: "INVOICE",
      entityId: id,
      details: `Status changed from ${oldInvoice.status} to ${status}`,
      userId: user.id
    }
  });
  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
}
