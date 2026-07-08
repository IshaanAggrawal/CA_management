import { prisma } from "@/lib/db";
import { getFirmId } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import InvoiceClient from "./InvoiceClient";

export default async function InvoicePage({ params }: { params: { id: string } }) {
  const firmId = await getFirmId();
  if (!firmId) redirect("/login");

  // Await the params object in Next.js 15
  const resolvedParams = await params;
  const invoiceId = resolvedParams.id;

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId, firmId: firmId },
    include: {
      client: true,
      firm: true,
    }
  });

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-semibold text-lg">Invoice not found or unauthorized.</p>
      </div>
    );
  }

  // Convert Prisma Decimal to number if needed
  const amountNumber = typeof invoice.amount === "number" ? invoice.amount : (invoice.amount as any).toNumber();

  const formattedInvoice = {
    id: invoice.id,
    amount: amountNumber,
    status: invoice.status,
    dueDate: invoice.dueDate,
    createdAt: invoice.createdAt,
    client: {
      name: invoice.client.name,
      email: invoice.client.email,
      phone: invoice.client.phone,
      address: invoice.client.city,
    },
    firm: {
      name: invoice.firm?.name || "Unknown Firm",
    }
  };

  return <InvoiceClient invoice={formattedInvoice} />;
}
