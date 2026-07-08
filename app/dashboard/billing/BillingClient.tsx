"use client";

import { useState } from "react";
import { createInvoice, deleteInvoice, updateInvoiceStatus } from "@/lib/actions/billing-actions";

type BillingInvoice = {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "OVERDUE";
  dueDate: string | Date;
  paymentLinkUrl?: string | null;
  client: {
    name: string;
  };
};

type BillingMetrics = {
  outstandingPayments: number;
  billedThisMonth: number;
  invoicesThisMonth: number;
  collectionRate: number;
  billedGrowth: number;
};

type BillingClientProps = {
  invoices?: BillingInvoice[];
  metrics: BillingMetrics;
  clients?: { id: string; name: string }[];
};

export default function BillingClient({ invoices = [], metrics, clients = [] }: BillingClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const handleCreateInvoice = async (formData: FormData) => {
    setIsSaving(true);
    try {
      await createInvoice(formData);
      setIsCreateOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error creating invoice. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setIsUpdatingId(id);
    try {
      await deleteInvoice(id);
    } catch (e: any) {
      alert(e.message || "Failed to delete");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleGenerateLink = async (id: string) => {
    setIsUpdatingId(id);
    try {
      // Lazy load to prevent client errors if razorpay is huge
      const { generatePaymentLink } = await import("@/lib/actions/razorpay-actions");
      const url = await generatePaymentLink(id);
      window.open(url, "_blank");
    } catch (e: any) {
      alert(e.message || "Failed to generate link");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    setIsUpdatingId(id);
    try {
      await updateInvoiceStatus(id, "PAID");
    } catch (e: any) {
      alert(e.message || "Failed to update");
    } finally {
      setIsUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return alert("No invoices to export");
    const headers = "ID,Client,Amount,Due Date,Status\n";
    const rows = invoices.map(inv => 
      `${inv.id},"${inv.client?.name || ''}",${inv.amount},${new Date(inv.dueDate).toISOString().split('T')[0]},${inv.status}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "invoices_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary">Billing & Invoicing</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage client receivables and financial reporting.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="bg-secondary text-on-secondary px-6 py-2.5 rounded-lg font-title-lg text-title-lg flex items-center gap-2 hover:shadow-md transition-all active:scale-95 cursor-pointer">
          <span className="material-symbols-outlined">add</span>
          Generate New Invoice
        </button>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Outstanding Payments */}
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">OUTSTANDING PAYMENTS</p>
              <h3 className="font-display-lg text-display-lg text-error">₹{metrics.outstandingPayments.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-error-container rounded-lg flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[28px]">pending_actions</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-error font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            <span>Unpaid Invoices</span>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">account_balance_wallet</span>
          </div>
        </div>

        {/* Total Billed this Month */}
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">TOTAL BILLED THIS MONTH</p>
              <h3 className="font-display-lg text-display-lg text-primary">₹{metrics.billedThisMonth.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">description</span>
            </div>
          </div>
          <div className={`flex items-center gap-2 font-label-sm text-label-sm ${metrics.billedGrowth >= 0 ? "text-emerald-600" : "text-error"}`}>
            <span className="material-symbols-outlined text-[16px]">{metrics.billedGrowth >= 0 ? "trending_up" : "trending_down"}</span>
            <span>{Math.abs(metrics.billedGrowth).toFixed(1)}% vs last month</span>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">receipt_long</span>
          </div>
        </div>

        {/* Collection Rate */}
        <div className="glass-card p-6 rounded-xl flex flex-col justify-between overflow-hidden relative group transition-transform hover:-translate-y-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant mb-1">COLLECTION RATE</p>
              <h3 className="font-display-lg text-display-lg text-on-tertiary-container">{metrics.collectionRate.toFixed(1)}%</h3>
            </div>
            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center text-on-tertiary-fixed-variant">
              <span className="material-symbols-outlined text-[28px]">payments</span>
            </div>
          </div>
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div className="bg-on-tertiary-container h-full rounded-full" style={{ width: `${metrics.collectionRate}%` }}></div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="material-symbols-outlined text-[120px]">show_chart</span>
          </div>
        </div>
      </div>

      {/* Invoices Section */}
      <section className="glass-card rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-white/50">
          <h4 className="font-title-lg text-title-lg text-on-surface">Recent Invoices</h4>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-outline-variant rounded-md text-on-surface-variant font-label-md text-label-md flex items-center gap-1 hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              Filter
            </button>
            <button onClick={handleExportCSV} className="px-3 py-1.5 border border-outline-variant rounded-md text-on-surface-variant font-label-md text-label-md flex items-center gap-1 hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
          </div>
        </div>
        
        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 border-b border-outline-variant">Client Name</th>
                <th className="px-6 py-4 border-b border-outline-variant">Invoice ID</th>
                <th className="px-6 py-4 border-b border-outline-variant">Amount</th>
                <th className="px-6 py-4 border-b border-outline-variant">Date</th>
                <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-white">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant font-label-md">No invoices found</td>
                </tr>
              ) : (
                  invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-xs">{invoice.client?.name.substring(0,2).toUpperCase()}</div>
                        <span className="font-body-md text-body-md font-semibold text-on-surface">{invoice.client?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">INV-{invoice.id.substring(0, 6).toUpperCase()}</td>
                    <td className="px-6 py-4 font-body-md text-body-md font-bold">₹{invoice.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {invoice.status === "PAID" ? (
                        <span className="px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full font-label-sm text-label-sm flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-[14px]">check</span> Paid
                        </span>
                      ) : invoice.status === "OVERDUE" || (invoice.dueDate && new Date(invoice.dueDate) < new Date()) ? (
                        <span className="px-2 py-1 bg-error-container text-error rounded-full font-label-sm text-label-sm flex items-center gap-1 w-fit">
                          <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span> Overdue
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-surface-container-highest text-on-surface-variant rounded-full font-label-sm text-label-sm flex items-center gap-1 w-fit">
                          <span className="material-symbols-outlined text-[14px]">schedule</span> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isUpdatingId === invoice.id ? (
                          <span className="text-xs text-slate-400">Updating...</span>
                        ) : (
                          <>
                            {invoice.status !== "PAID" && (
                              <>
                                <button onClick={() => invoice.paymentLinkUrl ? window.open(invoice.paymentLinkUrl, "_blank") : handleGenerateLink(invoice.id)} className={`p-1.5 rounded-md transition-colors cursor-pointer ${invoice.paymentLinkUrl ? "text-primary hover:bg-primary-container" : "text-secondary hover:bg-secondary-container"}`} title={invoice.paymentLinkUrl ? "Open Payment Link" : "Generate Razorpay Link"}>
                                  <span className="material-symbols-outlined text-[20px]">{invoice.paymentLinkUrl ? "open_in_new" : "link"}</span>
                                </button>
                                <button onClick={() => handleMarkAsPaid(invoice.id)} className="p-1.5 text-primary hover:bg-primary-container rounded-md transition-colors cursor-pointer" title="Mark as Paid">
                                  <span className="material-symbols-outlined text-[20px]">task_alt</span>
                                </button>
                              </>
                            )}
                            <button onClick={() => handleDelete(invoice.id)} className="p-1.5 text-error hover:bg-error-container rounded-md transition-colors cursor-pointer" title="Delete Invoice">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Table Footer/Pagination */}
        <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing 1-{invoices.length} of {invoices.length} invoices</span>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-secondary text-on-secondary font-label-md text-label-md cursor-pointer">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors font-label-md text-label-md cursor-pointer">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>

      {/* Insights & Micro-interactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Payment Trend Chart Simulation */}
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h5 className="font-title-lg text-title-lg text-primary">Payment Trends</h5>
            <select className="bg-transparent border-none font-label-sm text-label-sm text-on-surface-variant focus:ring-0 cursor-pointer">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          {/* Simulated Chart */}
          <div className="flex items-end justify-between h-48 gap-4 px-4">
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-surface-container rounded-t h-[40%] group-hover:bg-secondary/40 transition-colors"></div>
              <span className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Jun</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-surface-container rounded-t h-[55%] group-hover:bg-secondary/40 transition-colors"></div>
              <span className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Jul</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-surface-container rounded-t h-[75%] group-hover:bg-secondary/40 transition-colors"></div>
              <span className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Aug</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-surface-container rounded-t h-[65%] group-hover:bg-secondary/40 transition-colors"></div>
              <span className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Sep</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-secondary/60 rounded-t h-[90%] group-hover:bg-secondary transition-colors relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">₹{metrics.billedThisMonth >= 100000 ? (metrics.billedThisMonth / 100000).toFixed(1) + "L" : metrics.billedThisMonth}</div>
              </div>
              <span className="font-label-sm text-label-sm mt-2 font-bold text-primary">Oct</span>
            </div>
            <div className="flex flex-col items-center flex-1 group">
              <div className="w-full bg-surface-container rounded-t h-[45%] group-hover:bg-secondary/40 transition-colors"></div>
              <span className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Nov</span>
            </div>
          </div>
        </div>
        
        {/* Quick Reminders Glassmorphism */}
        <div className="glass-card p-6 rounded-xl border-secondary/20 bg-secondary-container/5 relative overflow-hidden">
          <h5 className="font-title-lg text-title-lg text-secondary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">auto_awesome</span>
            Smart Reminders
          </h5>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Automated collection engine detected 3 high-priority overdue payments.</p>
          <div className="space-y-3 relative z-10">
            {invoices.filter((invoice) => invoice.status !== "PAID").slice(0,2).map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-white/80 rounded-lg border border-outline-variant hover:border-secondary transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="text-error"><span className="material-symbols-outlined">warning</span></div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">{invoice.client?.name}</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">₹{invoice.amount.toLocaleString()} • Overdue</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity">send</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-lg font-label-md text-label-md hover:bg-secondary/20 transition-colors cursor-pointer">
            Automate All Reminders
          </button>
          
          {/* Decorative Background Pattern */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
            <svg fill="none" height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
              <circle className="text-secondary" cx="150" cy="150" fill="currentColor" r="100"></circle>
            </svg>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form action={handleCreateInvoice} className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Generate New Invoice</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client</label>
                <select name="clientId" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white">
                  <option value="">Select client</option>
                  {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount (₹)</label>
                <input name="amount" type="number" step="0.01" min="1" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="e.g. 5000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
                <input name="dueDate" type="date" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-80 disabled:cursor-not-allowed">
                {isSaving ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> : "Generate"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
