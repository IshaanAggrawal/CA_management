"use client";

import { useEffect } from "react";

type InvoiceClientProps = {
  invoice: {
    id: string;
    amount: number;
    status: string;
    dueDate: Date;
    createdAt: Date;
    client: {
      name: string;
      email: string | null;
      phone: string | null;
      address: string | null;
    };
    firm: {
      name: string;
    };
  };
};

export default function InvoiceClient({ invoice }: InvoiceClientProps) {
  useEffect(() => {
    // Automatically open the print dialog when this page loads
    // We add a tiny delay to ensure fonts/CSS are fully rendered
    const timeout = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* 
        This wrapper has max-width for screen viewing but spans full width on print. 
        We use print-specific CSS classes where necessary.
      */}
      <div className="max-w-4xl mx-auto p-8 md:p-12 text-slate-800 bg-white shadow-sm print:shadow-none print:p-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#005c53] mb-2">{invoice.firm.name}</h1>
            <p className="text-slate-500 font-medium">Professional CA Services</p>
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-slate-800 uppercase tracking-widest mb-2">Invoice</h2>
            <p className="text-slate-600"><strong>Invoice #:</strong> INV-{invoice.id.substring(0,6).toUpperCase()}</p>
            <p className="text-slate-600"><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString("en-IN")}</p>
            <p className="text-slate-600"><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString("en-IN")}</p>
            <p className="mt-2">
              <span className={`px-3 py-1 text-sm font-bold rounded-full border ${
                invoice.status === "PAID" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                invoice.status === "OVERDUE" ? "bg-red-50 text-red-600 border-red-200" :
                "bg-slate-50 text-slate-600 border-slate-200"
              }`}>
                {invoice.status}
              </span>
            </p>
          </div>
        </div>

        {/* Billed To Section */}
        <div className="mb-12">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">Billed To</h3>
          <p className="text-lg font-bold text-slate-800">{invoice.client.name}</p>
          {invoice.client.email && <p className="text-slate-600">{invoice.client.email}</p>}
          {invoice.client.phone && <p className="text-slate-600">{invoice.client.phone}</p>}
          {invoice.client.address && <p className="text-slate-600 mt-1">{invoice.client.address}</p>}
        </div>

        {/* Invoice Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-4 px-4 w-2/3">Description</th>
                <th className="py-4 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 px-4">
                  <p className="font-semibold text-slate-800">Professional Services Rendered</p>
                  <p className="text-sm text-slate-500">As per agreed scope of work.</p>
                </td>
                <td className="py-4 px-4 text-right font-medium text-slate-800">
                  ₹{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total Section */}
        <div className="flex justify-end mb-16">
          <div className="w-1/2 md:w-1/3">
            <div className="flex justify-between py-3 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Subtotal:</span>
              <span className="font-medium">₹{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-100 text-slate-500">
              <span>Tax (0%):</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between py-4 text-xl font-bold text-slate-800">
              <span>Total:</span>
              <span>₹{invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p className="font-medium text-slate-600 mb-1">Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact {invoice.firm.name}.</p>
        </div>

        {/* Non-print control to go back */}
        <div className="mt-12 text-center print:hidden">
          <button 
            onClick={() => window.close()} 
            className="px-6 py-2 bg-slate-100 text-slate-600 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Close Tab
          </button>
        </div>
      </div>
    </div>
  );
}
