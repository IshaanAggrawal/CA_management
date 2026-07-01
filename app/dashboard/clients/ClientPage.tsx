"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient, bulkDeleteClients } from "@/lib/actions/client-actions";

type ClientEntityType = "CORPORATE" | "INDIVIDUAL" | "LLP" | "OTHER";
type ClientStatus = "ACTIVE" | "PENDING_KYC" | "INACTIVE";

type ClientRow = {
  id: string;
  name: string;
  entityType: ClientEntityType;
  partnerName: string | null;
  contactPerson: string | null;
  city: string | null;
  pan: string | null;
  gstin: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
};

const entityTypeLabel: Record<ClientEntityType, string> = {
  CORPORATE: "Corporate",
  INDIVIDUAL: "Individual",
  LLP: "LLP",
  OTHER: "Other",
};

const entityTypeOptions: ClientEntityType[] = ["CORPORATE", "INDIVIDUAL", "LLP", "OTHER"];
const statusOptions: Array<ClientStatus | "ALL"> = ["ALL", "ACTIVE", "PENDING_KYC", "INACTIVE"];

type ClientsDirectoryClientProps = {
  initialClients: ClientRow[];
};

export default function ClientsDirectoryClient({ initialClients }: ClientsDirectoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<ClientEntityType | "ALL">("ALL");
  const [selectedPartner, setSelectedPartner] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState<ClientStatus | "ALL">("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const partnerOptions = Array.from(new Set(initialClients.map((client) => client.partnerName).filter(Boolean))) as string[];
  const cityOptions = Array.from(new Set(initialClients.map((client) => client.city).filter(Boolean))) as string[];

  const filteredClients = initialClients.filter((client) => {
    const matchesSearch = [
      client.name,
      client.pan,
      client.gstin,
      client.email,
      client.phone,
      client.contactPerson,
      client.partnerName,
      client.city,
    ]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesEntity = selectedEntity === "ALL" || client.entityType === selectedEntity;
    const matchesPartner = selectedPartner === "ALL" || client.partnerName === selectedPartner;
    const matchesStatus = selectedStatus === "ALL" || client.status === selectedStatus;
    const matchesCity = selectedCity === "ALL" || client.city === selectedCity;

    return matchesSearch && matchesEntity && matchesPartner && matchesStatus && matchesCity;
  });

  const activeClients = initialClients.filter((client) => client.status === "ACTIVE");
  const pendingKycClients = initialClients.filter((client) => client.status === "PENDING_KYC");
  const corporateClients = initialClients.filter((client) => client.entityType === "CORPORATE");
  const dataCompleteness = initialClients.length > 0
    ? Math.round((initialClients.filter((client) => client.contactPerson && client.email && client.phone).length / initialClients.length) * 100)
    : 0;

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-teal-50 text-teal-700 border border-teal-200";
      case "PENDING_KYC":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "INACTIVE":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const handleSaveClient = async (formData: FormData) => {
    setIsSaving(true);
    try {
      await createClient(formData);
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} clients?`)) return;
    setIsDeleting(true);
    try {
      await bulkDeleteClients(selectedIds);
      setSelectedIds([]);
    } catch (e: any) {
      alert(e.message || "Failed to delete clients");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusCount = (status: ClientStatus) => initialClients.filter((client) => client.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-tight">Client Directory</h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage {initialClients.length} client records with search, filters, and direct onboarding.
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">{activeClients.length}</h4>
            </div>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-xl p-3 flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">corporate_fare</span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Corporate</p>
              <h4 className="text-lg font-bold text-slate-800 leading-tight">{corporateClients.length}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-150 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          <div className="flex flex-col gap-1 w-full lg:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, PAN, GSTIN, email, city..."
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            />
          </div>

          <div className="flex flex-col gap-1 w-full lg:w-40">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entity Type</label>
            <select
              value={selectedEntity}
              onChange={(event) => setSelectedEntity(event.target.value as ClientEntityType | "ALL")}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              <option value="ALL">All Entities</option>
              {entityTypeOptions.map((entityType) => (
                <option key={entityType} value={entityType}>
                  {entityTypeLabel[entityType]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full lg:w-40">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Partner</label>
            <select
              value={selectedPartner}
              onChange={(event) => setSelectedPartner(event.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              <option value="ALL">All Partners</option>
              {partnerOptions.map((partnerName) => (
                <option key={partnerName} value={partnerName}>
                  {partnerName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 w-full lg:w-40">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={selectedStatus}
              onChange={(event) => setSelectedStatus(event.target.value as ClientStatus | "ALL")}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-slate-50 focus:outline-none focus:border-[#005c53]"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 rounded-lg font-semibold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">delete</span>
              {isDeleting ? "Deleting..." : `Delete (${selectedIds.length})`}
            </button>
          )}
          <button
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-semibold text-sm transition-all cursor-pointer ${isFilterExpanded ? "border-[#005c53] text-[#005c53] bg-teal-50" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <span className="material-symbols-outlined text-lg">filter_list</span>
            {isFilterExpanded ? "Less Filters" : "More Filters"}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#005c53] hover:bg-[#004841] text-white rounded-lg font-semibold text-sm shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            Add New Client
          </button>
        </div>
      </div>

      {isFilterExpanded && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-inner mt-2 animate-in fade-in slide-in-from-top-2 flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</label>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-[#005c53]"
            >
              <option value="ALL">All Cities</option>
              {cityOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedEntity("ALL");
              setSelectedPartner("ALL");
              setSelectedStatus("ALL");
              setSelectedCity("ALL");
            }}
            className="mt-5 text-sm font-bold text-[#005c53] hover:underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-10">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredClients.length && filteredClients.length > 0} 
                    onChange={toggleSelectAll} 
                    className="rounded border-slate-350 text-[#005c53] focus:ring-[#005c53] cursor-pointer" 
                  />
                </th>
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Entity</th>
                <th className="px-6 py-4">PAN / GSTIN</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Primary Email</th>
                <th className="px-6 py-4">Partner</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500">
                    No clients match the current filters.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(client.id)}
                        onChange={() => toggleSelect(client.id)}
                        className="rounded border-slate-350 text-[#005c53] focus:ring-[#005c53] cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{client.name}</span>
                        <span className="text-xs text-slate-400 font-medium">{statusCount(client.status) > 0 ? "Active record" : "Record"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{entityTypeLabel[client.entityType]}</td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-pre-line leading-relaxed">
                      {client.pan || "-"} / {client.gstin || "-"}
                    </td>
                    <td className="px-6 py-4 font-medium">{client.contactPerson || "-"}</td>
                    <td className="px-6 py-4">
                      {client.email ? (
                        <Link href={`mailto:${client.email}`} className="text-[#005c53] hover:underline font-medium">
                          {client.email}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium">{client.partnerName || "Unassigned"}</td>
                    <td className="px-6 py-4 font-medium">{client.city || "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusBadge(client.status)}`}>
                        {client.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <span className="material-symbols-outlined text-lg">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <p className="text-sm font-semibold text-slate-500">
            Showing <span className="text-slate-900 font-bold">1</span> to <span className="text-slate-900 font-bold">{filteredClients.length}</span> of <span className="text-slate-900 font-bold">{initialClients.length}</span> clients
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-white disabled:opacity-50">Previous</button>
            <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Compliance Health Across Clients</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium">
              {activeClients.length} clients are active, {pendingKycClients.length} are pending KYC, and {filteredClients.length} are visible in the current filter set.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Active</span>
                <span className="text-[#005c53]">{initialClients.length > 0 ? Math.round((activeClients.length / initialClients.length) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#005c53] h-full" style={{ width: `${initialClients.length > 0 ? (activeClients.length / initialClients.length) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                <span>Data Completeness</span>
                <span className="text-slate-600">{dataCompleteness}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-400 h-full" style={{ width: `${dataCompleteness}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1e293b] text-white rounded-xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-teal-400 border border-slate-700">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <h4 className="font-bold text-base">Audit Intelligence</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed font-medium">
                {pendingKycClients.length} clients still need KYC completion before the next compliance cycle.
              </p>
            </div>
          </div>

          <button
            onClick={async () => {
              setIsLoadingAI(true);
              await new Promise((resolve) => setTimeout(resolve, 1200));
              setIsLoadingAI(false);
            }}
            disabled={isLoadingAI}
            className="w-full mt-6 py-2.5 bg-white text-slate-900 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-all cursor-pointer shadow-sm relative z-10 text-center flex justify-center items-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
          >
            {isLoadingAI ? (
              <>Analyzing... <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span></>
            ) : (
              "View Recommendations"
            )}
          </button>

          <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" />
            </svg>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form action={handleSaveClient} className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Add New Client</h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client Legal Name</label>
                  <input name="name" type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="e.g. Acme Corp Ltd" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entity Type</label>
                  <select name="entityType" defaultValue="CORPORATE" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]">
                    {entityTypeOptions.map((entityType) => (
                      <option key={entityType} value={entityType}>
                        {entityTypeLabel[entityType]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact Person</label>
                  <input name="contactPerson" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="Primary contact" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Partner In Charge</label>
                  <input name="partnerName" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="Assigned partner" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">City</label>
                  <input name="city" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="Mumbai" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                  <input name="phone" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="+91..." />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                  <input name="email" type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="client@example.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">GSTIN</label>
                  <input name="gstin" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="27ABCDE1234F1Z5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">PAN</label>
                <input name="pan" type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="ABCDE1234F" />
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