import { prisma } from "@/lib/db";
import BillingClient from "./BillingClient";

type PrismaDecimalLike = { toNumber: () => number };

type BillingInvoiceRecord = {
  id: string;
  amount: number | PrismaDecimalLike;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: Date;
  client: {
    id: string;
    name: string;
  };
};

const toAmountNumber = (amount: number | PrismaDecimalLike) =>
  typeof amount === "number" ? amount : amount.toNumber();

export default async function BillingPage() {
  const rawInvoices = await prisma.invoice.findMany({
    include: { client: true },
    orderBy: { dueDate: "desc" }
  }) as BillingInvoiceRecord[];

  const invoices = rawInvoices.map((invoice) => ({
    id: invoice.id,
    amount: toAmountNumber(invoice.amount),
    status: invoice.status,
    dueDate: invoice.dueDate,
    client: {
      id: invoice.client.id,
      name: invoice.client.name,
    },
  }));

  // Calculate metrics
  const outstandingPayments = invoices
    .filter((invoice) => invoice.status !== "PAID")
    .reduce((sum: number, invoice) => sum + toAmountNumber(invoice.amount), 0);

  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const billedThisMonth = invoices
    .filter((invoice) => invoice.dueDate >= currentMonthStart)
    .reduce((sum: number, invoice) => sum + toAmountNumber(invoice.amount), 0);

  const totalBilled = invoices.reduce((sum: number, invoice) => sum + toAmountNumber(invoice.amount), 0);
  const totalCollected = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum: number, invoice) => sum + toAmountNumber(invoice.amount), 0);
    
  const collectionRate = totalBilled > 0 ? (totalCollected / totalBilled) * 100 : 0;

  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <BillingClient 
      invoices={invoices} 
      clients={clients}
      metrics={{
        outstandingPayments,
        billedThisMonth,
        invoicesThisMonth: invoices.filter((invoice) => invoice.dueDate >= currentMonthStart).length,
        collectionRate
      }}
    />
  );
}
