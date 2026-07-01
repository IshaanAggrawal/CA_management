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

  await prisma.invoice.create({
    data: {
      amount,
      dueDate,
      clientId,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");
}
