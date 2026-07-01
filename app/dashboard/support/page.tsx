"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type SupportTicket = {
  id: string;
  subject: string;
  status: "Resolved" | "In Progress" | "Open";
  updatedAt: string;
};

export default function SupportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [recentTickets, setRecentTickets] = useState<SupportTicket[]>([
    { id: "TCK-8921", subject: "GST Portal Sync Failing for new client", status: "Resolved", updatedAt: "Oct 24, 2023" },
    { id: "TCK-9014", subject: "Billing invoice format customization", status: "In Progress", updatedAt: "Today at 9:15 AM" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setRecentTickets((tickets) => [
        { id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`, subject: "New support request", status: "Open" as const, updatedAt: "Just now" },
        ...tickets,
      ].slice(0, 5));
      setTimeout(() => setSubmitted(false), 3000);
    }, 1500);
  };

  const canSubmit = useMemo(() => true, []);

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-primary">Help & Support</h2>
        <p className="font-body-md text-on-surface-variant mt-1">Submit a ticket, read our FAQs, or reach out to your dedicated account manager.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Support Form Column */}
        <div className="lg:col-span-2 bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-title-lg text-title-lg text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">support_agent</span>
              Submit a Support Request
            </h3>
            <p className="font-body-sm text-on-surface-variant mt-2">Our technical team typically responds within 2-4 business hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Issue Category <span className="text-error">*</span></label>
                <select required className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer">
                  <option value="">Select a category...</option>
                  <option value="billing">Billing & Invoicing</option>
                  <option value="technical">Technical Bug/Issue</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account & Profile Settings</option>
                  <option value="integration">API & Integrations</option>
                </select>
              </div>

              {/* Priority Dropdown */}
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Priority Level <span className="text-error">*</span></label>
                <select required className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer">
                  <option value="low">Low - General Inquiry</option>
                  <option value="medium">Medium - Workflow Impaired</option>
                  <option value="high">High - Critical Issue</option>
                </select>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Subject Line <span className="text-error">*</span></label>
              <input
                required
                type="text"
                placeholder="Brief summary of your issue..."
                className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {/* Description Area */}
            <div className="space-y-2">
              <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Detailed Description <span className="text-error">*</span></label>
              <textarea
                required
                rows={5}
                placeholder="Please describe your issue in detail. What steps led to this? What did you expect to happen?"
                className="w-full px-4 py-3 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
              ></textarea>
            </div>

            {/* File Upload */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center text-center bg-surface-container-lowest hover:bg-surface-container hover:border-primary transition-all cursor-pointer group w-full"
            >
              <div className="w-12 h-12 bg-surface shadow-sm border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors mb-3">
                <span className="material-symbols-outlined">cloud_upload</span>
              </div>
              <p className="font-label-md text-primary">{selectedFileName ? selectedFileName : "Click to upload screenshots"}</p>
              <p className="font-body-sm text-on-surface-variant mt-1">PNG, JPG, or PDF (Max 5MB)</p>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="hidden"
              onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name || null)}
            />

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-between border-t border-outline-variant">
              <p className="font-body-sm text-on-surface-variant mt-4">
                <span className="text-error">*</span> Required fields
              </p>
              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className={`flex items-center gap-2 px-6 py-2.5 mt-4 rounded-lg font-label-lg shadow-sm transition-all ${
                  submitted
                    ? "bg-primary text-on-primary"
                    : isSubmitting
                    ? "bg-secondary text-white opacity-80 cursor-wait"
                    : "bg-secondary hover:brightness-110 text-white cursor-pointer"
                }`}
              >
                {submitted ? (
                  <>
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    Ticket Submitted
                  </>
                ) : isSubmitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">send</span>
                    Submit Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info & History Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Contact Info */}
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h4 className="font-title-md text-primary mb-4">Direct Contact</h4>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-container text-on-secondary-container rounded-lg">
                  <span className="material-symbols-outlined">phone_in_talk</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase">Phone Support</p>
                  <p className="font-label-lg text-primary mt-1">1-800-CA-PRO-99</p>
                  <p className="font-body-sm text-on-surface-variant mt-0.5">Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-container text-primary rounded-lg">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase">Email Support</p>
                  <a href="mailto:support@proauditca.com?subject=Support%20Request" className="font-label-lg text-secondary mt-1 block hover:underline">support@proauditca.com</a>
                </div>
              </div>
              <button onClick={() => router.push("/dashboard/search?q=support")} className="w-full mt-4 px-4 py-2.5 rounded-lg border border-outline-variant text-primary font-label-md hover:bg-surface-container transition-colors">
                Search Knowledge Base
              </button>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h4 className="font-title-sm text-primary">Recent Tickets</h4>
              <button onClick={() => router.push("/dashboard/search?q=tickets")} className="font-label-sm text-secondary hover:underline cursor-pointer uppercase tracking-wider">View All</button>
            </div>
            <div className="divide-y divide-outline-variant">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} onClick={() => router.push(`/dashboard/search?q=${encodeURIComponent(ticket.subject)}`)} className="p-4 hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-label-sm font-mono text-on-surface-variant group-hover:text-secondary">#{ticket.id}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        ticket.status === "Resolved" ? "bg-primary-container text-primary" : 
                        ticket.status === "In Progress" ? "bg-secondary-container text-on-secondary-container" : 
                        "bg-tertiary-container text-on-tertiary-container"
                    }`}>
                      {ticket.status}
                    </span>
                  </div>
                  <h5 className="font-label-md text-primary line-clamp-1 mb-1">{ticket.subject}</h5>
                  <p className="font-body-sm text-on-surface-variant">Updated {ticket.updatedAt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
