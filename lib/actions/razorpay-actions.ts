"use server";

import { prisma } from "@/lib/db";
import Razorpay from "razorpay";
import { revalidatePath } from "next/cache";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function generatePaymentLink(invoiceId: string) {
  try {
    const { getFirmId } = await import("@/lib/auth-utils");
    const firmId = await getFirmId();
    if (!firmId) throw new Error("Unauthorized");

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId, firmId },
      include: { client: true },
    });

    if (!invoice) throw new Error("Invoice not found");

    if (invoice.paymentLinkUrl) {
      return invoice.paymentLinkUrl; // Return existing link if it exists
    }

    // Convert amount to paise (multiply by 100)
    const amountInPaise = Math.round(Number(invoice.amount) * 100);

    const paymentLinkRequest = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Invoice ${invoice.id.substring(0, 8).toUpperCase()} for ${invoice.client.name}`,
      customer: {
        name: invoice.client.name,
        email: invoice.client.email || "client@example.com",
        contact: invoice.client.phone || "9999999999",
      },
      notify: {
        sms: false,
        email: true,
      },
      reminder_enable: true,
      notes: {
        invoice_id: invoice.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      callback_method: "get"
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paymentLinkId: paymentLink.id,
        paymentLinkUrl: paymentLink.short_url,
      },
    });

    revalidatePath("/dashboard/billing");
    return paymentLink.short_url;

  } catch (error: any) {
    console.error("Razorpay Error:", error);
    throw new Error(error.message || "Failed to generate payment link");
  }
}

export async function verifyInvoicePayment(paymentLinkId: string) {
  try {
    const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
    
    if (paymentLink.status === "paid") {
      const invoiceId = paymentLink.notes?.invoice_id as string | undefined;
      
      if (invoiceId) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: "PAID" }
        });
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to verify invoice payment link", error);
    return false;
  }
}
