"use client";

import { useState } from "react";

export default function SupportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000); // reset after 3s
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-[28px] font-bold text-slate-900 leading-tight">Help & Support</h2>
        <p className="text-slate-500 text-sm mt-1">Submit a ticket, read our FAQs, or reach out to your dedicated account manager.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Support Form Column */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-[#005c53]">support_agent</span>
              Submit a Support Request
            </h3>
            <p className="text-sm text-slate-500 mt-1">Our technical team typically responds within 2-4 business hours.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Issue Category <span className="text-red-500">*</span></label>
                <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-[#005c53] focus:ring-1 focus:ring-[#005c53]/20 transition-all cursor-pointer">
                  <option value="">Select a category...</option>
                  <option value="billing">Billing & Invoicing</option>
                  <option value="technical">Technical Bug/Issue</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account & Profile Settings</option>
                  <option value="integration">API & Integrations</option>
                </select>
              </div>

              {/* Priority Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority Level <span className="text-red-500">*</span></label>
                <select required className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-[#005c53] focus:ring-1 focus:ring-[#005c53]/20 transition-all cursor-pointer">
                  <option value="low">Low - General Inquiry</option>
                  <option value="medium">Medium - Workflow Impaired</option>
                  <option value="high">High - Critical Issue</option>
                </select>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subject Line <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                placeholder="Brief summary of your issue..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-[#005c53] focus:ring-1 focus:ring-[#005c53]/20 transition-all"
              />
            </div>

            {/* Description Area */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detailed Description <span className="text-red-500">*</span></label>
              <textarea
                required
                rows={5}
                placeholder="Please describe your issue in detail. What steps led to this? What did you expect to happen?"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-[#005c53] focus:ring-1 focus:ring-[#005c53]/20 transition-all resize-none"
              ></textarea>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#005c53] transition-colors mb-3">
                <span className="material-symbols-outlined">cloud_upload</span>
              </div>
              <p className="text-sm font-bold text-slate-700">Click to upload screenshots</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, or PDF (Max 5MB)</p>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                <span className="text-red-500">*</span> Required fields
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-all ${
                  submitted
                    ? "bg-green-600 text-white"
                    : isSubmitting
                    ? "bg-[#005c53]/80 text-white cursor-wait"
                    : "bg-[#005c53] hover:bg-[#004841] text-white cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-slate-900 text-base mb-4">Direct Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
                  <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Phone Support</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">1-800-CA-PRO-99</p>
                  <p className="text-xs text-slate-500 mt-0.5">Mon-Fri, 9am - 6pm EST</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Email Support</p>
                  <p className="text-sm font-semibold text-[#005c53] mt-0.5 cursor-pointer hover:underline">support@proauditca.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="font-bold text-slate-900 text-sm">Recent Tickets</h4>
              <button className="text-[11px] font-bold text-[#005c53] hover:underline cursor-pointer uppercase tracking-wider">View All</button>
            </div>
            <div className="divide-y divide-slate-100">
              {/* Ticket 1 */}
              <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#005c53]">#TCK-8921</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-700 border border-green-200">
                    Resolved
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">GST Portal Sync Failing for new client</h5>
                <p className="text-xs text-slate-500">Updated Oct 24, 2023</p>
              </div>
              
              {/* Ticket 2 */}
              <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-[#005c53]">#TCK-9014</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    In Progress
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-slate-800 line-clamp-1 mb-1">Billing invoice format customization</h5>
                <p className="text-xs text-slate-500">Updated Today at 9:15 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
