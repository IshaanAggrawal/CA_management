"use client";

import { useEffect, useState } from "react";

type UserData = {
  name: string;
  email: string;
  role: string;
};

export default function SettingsClient({ user }: { user: UserData }) {
  const [activeTab, setActiveTab] = useState<"profile" | "keys" | "integrations">("profile");
  const [isSaved, setIsSaved] = useState(false);
  
  const isAdmin = user.role === "ADMIN";

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

  const handleCopyPrefix = async (prefix: string) => {
    await navigator.clipboard.writeText(prefix);
  };

  const handleRevokeKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  useEffect(() => {
    if (!isSaved) return;
    const timer = setTimeout(() => setIsSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [isSaved]);

  return (
    <div className="max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-primary">Practice Settings</h2>
        <p className="font-body-md text-on-surface-variant mt-1">
          {isAdmin 
            ? "Configure your profile, API tokens, and sync external integrations." 
            : "View your profile and contact information."}
        </p>
      </div>

      {/* Tab Switcher - Only Admins see Keys and Integrations */}
      <div className="flex border-b border-outline-variant gap-8">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 font-label-md text-label-md transition-all cursor-pointer ${
            activeTab === "profile" 
              ? "border-b-2 border-primary text-primary" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Profile
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("keys")}
              className={`pb-3 font-label-md text-label-md transition-all cursor-pointer ${
                activeTab === "keys" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab("integrations")}
              className={`pb-3 font-label-md text-label-md transition-all cursor-pointer ${
                activeTab === "integrations" 
                  ? "border-b-2 border-primary text-primary" 
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Integrations
            </button>
          </>
        )}
      </div>

      {/* Profile Settings Tab */}
      {activeTab === "profile" && (
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest">
            <h3 className="font-title-md text-title-md text-primary">Profile Details</h3>
            <p className="font-body-sm text-on-surface-variant mt-1">Your professional and office contact information.</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-outline-variant">
              <div className="w-20 h-20 rounded-full bg-primary-container text-primary flex items-center justify-center font-display-sm shadow-sm border-2 border-surface">
                {user.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h4 className="font-title-md text-primary">{user.name}</h4>
                <p className="font-body-sm text-on-surface-variant">
                  {user.role === "ADMIN" ? "Admin" : "Staff Member"} • Tax & Compliance Dept
                </p>
                {isAdmin && (
                  <div className="flex gap-2 justify-center sm:justify-start pt-2">
                    <button className="px-4 py-2 border border-outline-variant text-primary font-label-md rounded hover:bg-surface-container transition-all cursor-pointer">
                      Change Photo
                    </button>
                    <button className="px-4 py-2 text-error hover:text-error hover:bg-error-container font-label-md rounded transition-all cursor-pointer">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all disabled:opacity-70"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">System Role</label>
                <input
                  type="text"
                  defaultValue={user.role}
                  disabled
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg font-body-md text-on-surface bg-surface-container-low focus:outline-none transition-all opacity-70"
                />
              </div>
            </div>
            
            {isAdmin && (
              <div className="pt-6 flex justify-end">
                <button onClick={() => setIsSaved(true)} className="px-6 py-2.5 bg-secondary hover:brightness-110 text-white rounded-lg font-label-lg shadow-sm transition-all cursor-pointer">
                  {isSaved ? "Saved" : "Save Profile Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* API Keys Settings Tab */}
      {isAdmin && activeTab === "keys" && (
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-outline-variant bg-surface-container-lowest flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-title-md text-title-md text-primary">API Tokens & Access</h3>
              <p className="font-body-sm text-on-surface-variant mt-1">Generate tokens to authenticate API access for custom integrations.</p>
            </div>
            <button
              onClick={handleGenerateKey}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:brightness-110 text-white rounded-lg font-label-md shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">key</span> Generate New Key
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant font-label-sm text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-4">Key Name</th>
                  <th className="px-6 py-4">Prefix</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-on-surface font-body-md">
                {apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="px-6 py-4 font-semibold text-primary">{key.name}</td>
                    <td className="px-6 py-4 font-mono text-sm text-on-surface-variant">
                      <button onClick={() => handleCopyPrefix(key.prefix)} className="hover:text-primary transition-colors cursor-pointer text-left flex items-center gap-2">
                        {key.prefix}
                        <span className="material-symbols-outlined text-sm opacity-50">content_copy</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{key.created}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-primary-container text-primary">
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="text-error hover:bg-error-container px-2 py-1 rounded transition-colors font-label-md"
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
      {isAdmin && activeTab === "integrations" && (
        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm">
            <h3 className="font-title-md text-title-md text-primary">Connected Applications</h3>
            <p className="font-body-sm text-on-surface-variant mt-1">Manage API integrations with government tax portals and productivity apps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrations.map((item) => (
              <div key={item.id} className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm flex items-start gap-4 hover:border-primary transition-all">
                <div className="w-12 h-12 bg-primary-container rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-title-md text-primary">{item.name}</h4>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleIntegration(item.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.connected ? 'bg-secondary' : 'bg-surface-container-high'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.connected ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
                  <div className="pt-2">
                    <span className={`font-label-sm uppercase tracking-wider ${
                      item.connected ? 'text-secondary' : 'text-on-surface-variant'
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
