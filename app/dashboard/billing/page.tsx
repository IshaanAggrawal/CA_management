import { prisma } from "@/lib/db";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const invoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { dueDate: "desc" }
  });

  // Calculate metrics
  const outstandingPayments = invoices
    .filter((inv: any) => inv.status !== "PAID")
    .reduce((sum: number, inv: any) => sum + inv.amount, 0);

  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const billedThisMonth = invoices
    .filter((inv: any) => inv.dueDate >= currentMonthStart)
    .reduce((sum: number, inv: any) => sum + inv.amount, 0);

  const totalBilled = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const totalCollected = invoices
    .filter((inv: any) => inv.status === "PAID")
    .reduce((sum: number, inv: any) => sum + inv.amount, 0);
    
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  return (
    <BillingClient 
      invoices={invoices} 
      metrics={{
        outstandingPayments,
        billedThisMonth,
        invoicesThisMonth: invoices.filter((inv: any) => inv.dueDate >= currentMonthStart).length,
        collectionRate
      }}
    />
  );
}
