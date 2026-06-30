"use client";

import { useState } from "react";
import Link from "next/link";

interface Client {
  id: number;
  name: string;
  partner: string;
  type: string;
  panGstin: string;
  contactPerson: string;
  email: string;
  status: "Active" | "Pending KYC" | "Inactive";
}

import { createClient } from "@/lib/actions/client-actions";

export default function ClientsDirectoryClient({ initialClients }: { initialClients: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("All Entities");
  const [selectedPartner, setSelectedPartner] = useState("All Partners");
  const [selectedStatus, setSelectedStatus] = useState("Active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSaveClient = async (formData: FormData) => {
    setIsSaving(true);
    try {
      await createClient(formData);
      setIsModalOpen(false);
    } catch(e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadAI = async () => {
    setIsLoadingAI(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoadingAI(false);
  };

  // Use the initialClients mock data for now
  const clients = initialClients;

  // Status Badge Colors
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      case "PENDING KYC":
      case "PENDING_KYC":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "INACTIVE":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-tight">Client Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and monitor 1,248 registered clients across your practice.</p>
        </div>

        {/* Top Badges */}
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">1,102</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">corporate_fare</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corporate</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">456</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          {/* Entity Type Dropdown */}
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity Type</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              <option>All Entities</option>
              <option>Corporate</option>
              <option>Individual</option>
              <option>LLP</option>
            </select>
          </div>

          {/* Partner Dropdown */}
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner in Charge</label>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              <option>All Partners</option>
              <option>S. Sharma</option>
              <option>A. Gupta</option>
              <option>R. Malhotra</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              <option>Active</option>
              <option>Pending KYC</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button onClick={() => setIsFilterExpanded(!isFilterExpanded)} className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${isFilterExpanded ? 'border-[#005c53] text-[#005c53] bg-teal-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined text-lg">filter_list</span> {isFilterExpanded ? "Less Filters" : "More Filters"}
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#005c53] hover:bg-[#004841] text-white rounded-lg font-semibold text-sm shadow-sm transition-all cursor-pointer">
            <span className="material-symbols-outlined text-lg">person_add</span> Add New Client
          </button>
        </div>
      </div>
      
      {/* Expanded Filters */}
      {isFilterExpanded && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner mt-2 animate-in fade-in slide-in-from-top-2 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turnover Range</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-[#005c53]">
              <option>Any Turnover</option>
              <option>&lt; 1 Cr</option>
              <option>1 Cr - 5 Cr</option>
              <option>&gt; 5 Cr</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-[#005c53]">
              <option>All Cities</option>
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bangalore</option>
            </select>
          </div>
          <button className="mt-5 text-sm font-bold text-[#005c53] hover:underline cursor-pointer">Clear All</button>
        </div>
      )}

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-10">
                  <input type="checkbox" className="rounded border-slate-350 text-[#005c53] focus:ring-[#005c53]" />
                </th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">PAN / GSTIN</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Primary Email</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-slate-350 text-[#005c53] focus:ring-[#005c53]" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{client.name}</span>
                      <span className="text-xs text-slate-400 font-medium">Partner: Unassigned</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">Corporate</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-pre-line leading-relaxed">
                    {client.pan || "-"} / {client.gstin || "-"}
                  </td>
                  <td className="px-6 py-4 font-medium">-</td>
                  <td className="px-6 py-4">
                    <Link href={`mailto:${client.email || ""}`} className="text-[#005c53] hover:underline font-medium">
                      {client.email || "-"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors">
                      <span className="material-symbols-outlined text-lg">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">1</span> to <span className="text-slate-900 font-bold">{clients.length}</span> of <span className="text-slate-900 font-bold">{clients.length}</span> clients
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* Bottom Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Compliance Health */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Compliance Health Across Clients</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              92% of your corporate clients have updated their GST filings for the current quarter. 8 clients require immediate intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>On-Track</span>
                <span className="text-[#005c53]">92%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#005c53] h-full" style={{ width: "92%" }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Due Soon</span>
                <span className="text-slate-600">30%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: "30%" }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit Intelligence Card */}
        <div className="lg:col-span-2 bg-[#1e293b] text-white rounded-xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-teal-400 border border-slate-700">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <h4 className="font-bold text-base">Audit Intelligence</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                We found 12 potential tax optimization opportunities for individual clients in the 'Professional' category.
              </p>
            </div>
          </div>

          <button 
            onClick={handleLoadAI} 
            disabled={isLoadingAI}
            className="w-full mt-6 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm relative z-10 text-center flex justify-center items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isLoadingAI ? (
              <>Analyzing... <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span></>
            ) : (
              "View Recommendations"
            )}
          </button>

          {/* Decorative SVG Pattern */}
          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Mock Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form action={handleSaveClient} className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Add New Client</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client Legal Name</label>
                <input name="name" type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="e.g. Acme Corp Ltd" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input name="email" type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="client@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PAN</label>
                  <input name="pan" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="ABCDE1234F" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GSTIN</label>
                  <input name="gstin" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="27ABCDE1234F1Z5" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-[#005c53] hover:bg-[#004841] text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                ) : (
                  "Save Client"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
