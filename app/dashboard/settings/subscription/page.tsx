import { prisma } from "@/lib/db";
import SubscriptionClient from "./SubscriptionClient";
import { getFirmId } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import { verifyUpgradePayment } from "@/lib/actions/subscription-actions";

export default async function SubscriptionPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const firmId = await getFirmId();
  if (!firmId) redirect("/");

  // Locally verify payment if a payment link ID is passed back in the URL
  const params = await searchParams;
  const paymentLinkId = params?.razorpay_payment_link_id as string | undefined;
  if (paymentLinkId) {
    await verifyUpgradePayment(paymentLinkId);
    // After verification, redirect to clean the URL
    redirect("/dashboard/settings/subscription");
  }

  const firm = await prisma.firm.findUnique({
    where: { id: firmId },
    include: {
      _count: {
        select: { clients: true, users: true }
      }
    }
  });

  if (!firm) redirect("/");

  return <SubscriptionClient firm={firm} />;
}
