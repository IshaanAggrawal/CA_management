"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"profile" | "keys" | "integrations">("profile");
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: "GST Portal Sync Key", prefix: "gsp_live_4a8bc...", created: "Sep 12, 2023", status: "Active" },
    { id: 2, name: "Developer Sandbox Key", prefix: "gsp_test_8f2cd...", created: "Oct 01, 2023", status: "Active" }
  ]);
  
  // Integrations state
  const [integrations, setIntegrations] = useState([
    { id: "gst", name: "Government GST Portal", desc: "Sync taxpayer data, download GSTR-2B, and push filings.", connected: true, icon: "receipt_long" },
    { id: "itax", name: "Income Tax Portal (E-filing)", desc: "Fetch client ITR filing history and map PAN statuses.", connected: true, icon: "account_balance" },
    { id: "gcal", name: "Google Calendar", desc: "Auto-sync tax compliance calendar deadlines to your calendar.", connected: true, icon: "calendar_month" },
    { id: "slack", name: "Slack Notifications", desc: "Send deadline alerts and assignment updates to your Slack channels.", connected: false, icon: "chat" },
    { id: "qbooks", name: "QuickBooks Integration", desc: "Export billing ledger, tax invoices, and expenses automatically.", connected: false, icon: "payments" },
  ]);

  const handleToggleIntegration = (id: string) => {
    setIntegrations(integrations.map(item => 
      item.id === id ? { ...item, connected: !item.connected } : item
    ));
  };

  const handleGenerateKey = () => {
    const newKey = {
      id: Date.now(),
      name: `Custom Integration Key ${apiKeys.length + 1}`,
      prefix: `gsp_live_${Math.random().toString(36).substring(2, 7)}...`,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: "Active"
    };
    setApiKeys([...apiKeys, newKey]);
  };

  const handleRevokeKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-[28px] font-bold text-slate-900 leading-tight">Practice Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure your profile, API tokens, and sync external integrations.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "profile" 
              ? "border-b-2 border-primary text-primary" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("keys")}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "keys" 
              ? "border-b-2 border-primary text-primary" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          API Keys
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`pb-3 text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "integrations" 
              ? "border-b-2 border-primary text-primary" 
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Integrations
        </button>
      </div>

      {/* Profile Settings Tab */}
      {activeTab === "profile" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Admin Profile Details</h3>
            <p className="text-xs text-slate-400 mt-1">Update your professional and office contact information.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
              <img
                src="/images/img-10.jpg"
                alt="Aditya Sharma"
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-200 shadow-sm"
              />
              <div className="text-center sm:text-left space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">Aditya Sharma</h4>
                <p className="text-xs text-slate-400">Senior Partner • Tax & Compliance Dept</p>
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button className="px-3 py-1.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
                    Change Photo
                  </button>
                  <button className="px-3 py-1.5 text-red-600 hover:text-red-700 font-semibold text-xs rounded-lg transition-all cursor-pointer">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  defaultValue="Aditya Sharma"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  defaultValue="aditya@proauditca.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Office Role</label>
                <input
                  type="text"
                  defaultValue="Senior Partner"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Number</label>
                <input
                  type="text"
                  defaultValue="+91 98765 43210"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-slate-50 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button className="px-5 py-2.5 bg-[#005c53] hover:bg-[#004841] text-white rounded-lg font-semibold text-sm shadow-sm transition-all cursor-pointer">
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys Settings Tab */}
      {activeTab === "keys" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">API Tokens & Access</h3>
              <p className="text-xs text-slate-400 mt-1">Generate tokens to authenticate API access for custom integrations.</p>
            </div>
            <button
              onClick={handleGenerateKey}
              className="flex items-center gap-2 px-4 py-2 bg-[#005c53] hover:bg-[#004841] text-white rounded-lg font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">key</span> Generate New Key
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Key Name</th>
                  <th className="px-6 py-4">Prefix</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{key.prefix}</td>
                    <td className="px-6 py-4 font-medium text-slate-500">{key.created}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-red-500 hover:text-red-700 transition-colors text-xs font-semibold hover:underline"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations Settings Tab */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 text-base">Connected Applications</h3>
            <p className="text-xs text-slate-400 mt-1">Manage API integrations with government tax portals and productivity apps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4 hover:border-slate-300 transition-all">
                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.connected ? 'bg-[#005c53]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.connected ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                  <div className="pt-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      item.connected ? 'text-teal-600' : 'text-slate-400'
                    }`}>
                      {item.connected ? "• Connected" : "• Disconnected"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
