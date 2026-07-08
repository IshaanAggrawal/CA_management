import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "test_secret";

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment_link.paid") {
      const paymentLink = event.payload.payment_link.entity;
      const firmId = paymentLink.notes?.firmId;
      const upgradeTier = paymentLink.notes?.upgradeTier;

      if (firmId && upgradeTier) {
        // Upgrade flow
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await prisma.firm.update({
          where: { id: firmId },
          data: {
            planTier: upgradeTier as any,
            subscriptionStatus: "ACTIVE",
            currentPeriodEnd: nextMonth,
          },
        });
      } else if (paymentLink.notes?.invoice_id) {
        // Normal invoice payment
        await prisma.invoice.update({
          where: { id: paymentLink.notes.invoice_id },
          data: { status: "PAID" }
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
