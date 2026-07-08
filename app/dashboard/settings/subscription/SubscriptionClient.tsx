"use client";

import { useState } from "react";
import { generateUpgradePaymentLink } from "@/lib/actions/subscription-actions";

type FirmWithCounts = {
  id: string;
  name: string;
  planTier: string;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
  _count: {
    clients: number;
    users: number;
  };
};

export default function SubscriptionClient({ firm }: { firm: FirmWithCounts }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async (tier: "PRO" | "ENTERPRISE") => {
    setLoading(true);
    try {
      const url = await generateUpgradePaymentLink(tier);
      window.location.href = url;
    } catch (error) {
      alert("Failed to initiate upgrade");
    }
    setLoading(false);
  };

  const limits = {
    FREE: { clients: 5, staff: 1 },
    PRO: { clients: 100, staff: 3 },
    ENTERPRISE: { clients: Infinity, staff: Infinity }
  };

  const currentLimits = limits[firm.planTier as keyof typeof limits] || limits.FREE;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-[28px] font-bold text-slate-900 leading-tight">Subscription & Billing</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your plan, usage limits, and billing details.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Current Plan: {firm.planTier}</h2>
          <p className="text-slate-500 text-sm mt-1">Status: <span className="font-semibold text-green-600">{firm.subscriptionStatus}</span></p>
          {firm.currentPeriodEnd && (
            <p className="text-slate-500 text-sm">Renews on: {new Date(firm.currentPeriodEnd).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Client Usage</h3>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
            <div 
              className="bg-[#005c53] h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (firm._count.clients / (currentLimits.clients === Infinity ? 1 : currentLimits.clients)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500">
            {firm._count.clients} / {currentLimits.clients === Infinity ? "Unlimited" : currentLimits.clients} Clients Used
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Staff Usage</h3>
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
            <div 
              className="bg-[#005c53] h-2.5 rounded-full" 
              style={{ width: `${Math.min(100, (firm._count.users / (currentLimits.staff === Infinity ? 1 : currentLimits.staff)) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-slate-500">
            {firm._count.users} / {currentLimits.staff === Infinity ? "Unlimited" : currentLimits.staff} Staff Used
          </p>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Free</h3>
            <p className="text-3xl font-bold text-slate-900 mt-4 mb-1">₹0<span className="text-sm text-slate-500 font-normal">/mo</span></p>
            <ul className="text-sm text-slate-600 space-y-2 mt-4 flex-1">
              <li>✓ 1 Admin</li>
              <li>✓ Up to 5 Clients</li>
              <li>✓ Basic CRM</li>
            </ul>
            <button disabled className="mt-6 w-full py-2 bg-slate-100 text-slate-500 rounded-lg font-semibold">
              {firm.planTier === "FREE" ? "Current Plan" : "Downgrade"}
            </button>
          </div>

          <div className="bg-white border-2 border-[#005c53] rounded-xl p-6 shadow-md flex flex-col relative">
            <div className="absolute top-0 right-0 bg-[#005c53] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
            <h3 className="text-lg font-bold text-slate-900">Pro</h3>
            <p className="text-3xl font-bold text-slate-900 mt-4 mb-1">₹999<span className="text-sm text-slate-500 font-normal">/mo</span></p>
            <ul className="text-sm text-slate-600 space-y-2 mt-4 flex-1">
              <li>✓ Up to 3 Staff</li>
              <li>✓ Up to 100 Clients</li>
              <li>✓ Document Management</li>
              <li>✓ Advanced Calculators</li>
            </ul>
            <button 
              onClick={() => handleUpgrade("PRO")}
              disabled={loading || firm.planTier === "PRO"} 
              className={`mt-6 w-full py-2 rounded-lg font-semibold ${firm.planTier === "PRO" ? "bg-slate-100 text-slate-500" : "bg-[#005c53] text-white hover:bg-[#004841]"}`}
            >
              {firm.planTier === "PRO" ? "Current Plan" : "Upgrade to Pro"}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
            <p className="text-3xl font-bold text-slate-900 mt-4 mb-1">₹2,499<span className="text-sm text-slate-500 font-normal">/mo</span></p>
            <ul className="text-sm text-slate-600 space-y-2 mt-4 flex-1">
              <li>✓ Unlimited Staff</li>
              <li>✓ Unlimited Clients</li>
              <li>✓ Priority Support</li>
              <li>✓ Dedicated Account Manager</li>
            </ul>
            <button 
              onClick={() => handleUpgrade("ENTERPRISE")}
              disabled={loading || firm.planTier === "ENTERPRISE"} 
              className={`mt-6 w-full py-2 rounded-lg font-semibold border ${firm.planTier === "ENTERPRISE" ? "bg-slate-100 text-slate-500 border-transparent" : "border-[#005c53] text-[#005c53] hover:bg-[#005c53] hover:text-white"}`}
            >
              {firm.planTier === "ENTERPRISE" ? "Current Plan" : "Upgrade to Enterprise"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
