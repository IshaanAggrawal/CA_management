"use server";

import { prisma } from "@/lib/db";
import Razorpay from "razorpay";
import { getFirmId } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "test",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "test",
});

export async function generateUpgradePaymentLink(tier: "PRO" | "ENTERPRISE") {
  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized");

  const firm = await prisma.firm.findUnique({ where: { id: firmId } });
  if (!firm) throw new Error("Firm not found");

  const amount = tier === "PRO" ? 999 : 2499;
  const amountInPaise = amount * 100;

  const { currentUser } = await import("@clerk/nextjs/server");
  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  try {
    const paymentLinkRequest = {
      amount: amountInPaise,
      currency: "INR",
      accept_partial: false,
      description: `Upgrade to ${tier} Plan`,
      customer: {
        name: firm.name,
        ...(userEmail && { email: userEmail }),
      },
      notify: {
        sms: false,
        email: !!userEmail,
      },
      reminder_enable: false,
      notes: {
        upgradeTier: tier,
        firmId: firmId,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/settings/subscription?success=true`,
      callback_method: "get"
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    return paymentLink.short_url;
  } catch (error: any) {
    console.error("Razorpay Sub Error:", error);
    throw new Error(error.message || "Failed to generate upgrade link");
  }
}

export async function verifyUpgradePayment(paymentLinkId: string) {
  try {
    const paymentLink = await razorpay.paymentLink.fetch(paymentLinkId);
    
    if (paymentLink.status === "paid") {
      const firmId = paymentLink.notes?.firmId as string | undefined;
      const upgradeTier = paymentLink.notes?.upgradeTier as string | undefined;
      
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
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error("Failed to verify payment link", error);
    return false;
  }
}
