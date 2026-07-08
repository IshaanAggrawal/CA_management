"use server";

import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { revalidatePath } from "next/cache";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function createSupportTicket(formData: {
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  description: string;
}, userId?: string | null) {
  try {
    // 1. Save to DB
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        ...(userId && { userId }),
      },
    });

    // 2. Send email notification via Resend
    const { data, error } = await resend.emails.send({
      from: "BVG Practice <onboarding@resend.dev>",
      to: "support@proauditca.com", // Or any fallback email for testing
      subject: `[${ticket.priority}] Support Request: ${ticket.subject}`,
      html: `
        <h2>New Support Ticket: #${ticket.id}</h2>
        <p><strong>Category:</strong> ${ticket.category}</p>
        <p><strong>Priority:</strong> ${ticket.priority}</p>
        <p><strong>User ID:</strong> ${userId || "Guest"}</p>
        <hr />
        <p><strong>Description:</strong></p>
        <p>${formData.description.replace(/\n/g, '<br/>')}</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      // Log it but don't fail the request since it was saved to DB
    }

    revalidatePath("/dashboard/support");
    return { success: true, ticket };
  } catch (error: any) {
    console.error("Create ticket error:", error);
    throw new Error(error.message || "Failed to create support ticket");
  }
}
