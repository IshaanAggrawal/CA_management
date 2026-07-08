"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadDocument, deleteDocument, createDsc, deleteDsc, createUdin, deleteUdin } from "@/lib/actions/document-actions";

type PrismaDocument = {
  id: string;
  name: string;
  url: string;
  size: number | null;
  direction: "INWARD" | "OUTWARD" | "INTERNAL";
  createdAt: Date;
  client?: { name: string };
  userId?: string | null;
};

type DigitalSignature = {
  id: string;
  providerName: string;
  password?: string | null;
  issueDate?: Date | null;
  expiryDate: Date;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  client?: { name: string };
};

type Udin = {
  id: string;
  udinNumber: string;
  documentType: string;
  generatedAt: Date;
  client?: { name: string };
  assignment?: { title: string } | null;
};

type Client = {
  id: string;
  name: string;
};

type DocumentCategory = "All" | "Income Tax" | "GST Returns" | "Statutory Audit" | "Incorporation";
type ActiveTab = "DOCUMENTS" | "DSC" | "UDIN";

export default function DocumentsClient({
  documents = [],
  clients = [],
  dscs = [],
  udins = [],
  currentUserRole,
  currentUserId
}: {
  documents: PrismaDocument[],
  clients: Client[],
  dscs: DigitalSignature[],
  udins: Udin[],
  currentUserRole: string,
  currentUserId: string
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("DOCUMENTS");
  
  // Documents State
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("All");
  const [sortNewest, setSortNewest] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // DSC State
  const [isDscModalOpen, setIsDscModalOpen] = useState(false);
  const [isCreatingDsc, setIsCreatingDsc] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // UDIN State
  const [isUdinModalOpen, setIsUdinModalOpen] = useState(false);
  const [isCreatingUdin, setIsCreatingUdin] = useState(false);

  // Actions
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await uploadDocument(formData);
      setIsUploadModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateDsc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingDsc(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createDsc(formData);
      setIsDscModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create DSC");
    } finally {
      setIsCreatingDsc(false);
    }
  };

  const handleCreateUdin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreatingUdin(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createUdin(formData);
      setIsUdinModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to create UDIN");
    } finally {
      setIsCreatingUdin(false);
    }
  };

  const handleDelete = async (id: string, type: "DOC" | "DSC" | "UDIN", e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    setIsDeleting(id);
    try {
      if (type === "DOC") await deleteDocument(id);
      if (type === "DSC") await deleteDsc(id);
      if (type === "UDIN") await deleteUdin(id);
    } catch (err: any) {
      alert(err.message || `Failed to delete ${type}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const getCategoryMatches = (docName: string, category: DocumentCategory) => {
    const lowerName = docName.toLowerCase();
    if (category === "Income Tax") return lowerName.includes("itr") || lowerName.includes("income") || lowerName.includes("tax");
    if (category === "GST Returns") return lowerName.includes("gst");
    if (category === "Statutory Audit") return lowerName.includes("audit");
    if (category === "Incorporation") return lowerName.includes("incorp") || lowerName.includes("company");
    return true;
  };

  const visibleDocuments = useMemo(() => {
    const items = documents.filter((document) => {
      if (activeCategory === "All") return true;
      return getCategoryMatches(document.name, activeCategory);
    });
    items.sort((left, right) => {
      const leftDate = new Date(left.createdAt).getTime();
      const rightDate = new Date(right.createdAt).getTime();
      return sortNewest ? rightDate - leftDate : leftDate - rightDate;
    });
    return items;
  }, [documents, sortNewest, activeCategory]);

  const categoryStats = useMemo(() => {
    const stats = {
      "Income Tax": { count: 0, size: 0 },
      "GST Returns": { count: 0, size: 0 },
      "Statutory Audit": { count: 0, size: 0 },
      "Incorporation": { count: 0, size: 0 },
      "All": { count: documents.length, size: documents.reduce((acc, doc) => acc + (doc.size || 0), 0) },
    };

    documents.forEach(doc => {
      (["Income Tax", "GST Returns", "Statutory Audit", "Incorporation"] as DocumentCategory[]).forEach(cat => {
        if (getCategoryMatches(doc.name, cat)) {
          stats[cat as keyof typeof stats].count++;
          stats[cat as keyof typeof stats].size += (doc.size || 0);
        }
      });
    });
    return stats;
  }, [documents]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb < 1000) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };

  return (
    <>
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Document Vault</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Manage client compliance documents, DSCs, and UDINs.</p>
        </div>
        <div className="flex gap-4">
          {activeTab === "DOCUMENTS" && (
            <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all active:opacity-80 cursor-pointer">
              <span className="material-symbols-outlined">upload</span>
              Upload Files
            </button>
          )}
          {activeTab === "DSC" && (
            <button onClick={() => setIsDscModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all active:opacity-80 cursor-pointer">
              <span className="material-symbols-outlined">key</span>
              Add DSC
            </button>
          )}
          {activeTab === "UDIN" && (
            <button onClick={() => setIsUdinModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all active:opacity-80 cursor-pointer">
              <span className="material-symbols-outlined">verified</span>
              Generate UDIN
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant mb-6">
        <button 
          onClick={() => setActiveTab("DOCUMENTS")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer ${activeTab === "DOCUMENTS" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          All Documents
        </button>
        <button 
          onClick={() => setActiveTab("DSC")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === "DSC" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          DSC Vault <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px]">{dscs.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab("UDIN")}
          className={`px-6 py-3 font-title-sm text-title-sm border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${activeTab === "UDIN" ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:text-primary"}`}
        >
          UDIN Registry <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full text-[10px]">{udins.length}</span>
        </button>
      </div>

      {/* TAB: DOCUMENTS */}
      {activeTab === "DOCUMENTS" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Bento Grid Stats */}
            {["Income Tax", "GST Returns", "Statutory Audit", "Incorporation"].map((cat) => (
              <div key={cat} onClick={() => setActiveCategory(cat as DocumentCategory)} className={`bg-white border p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer ${activeCategory === cat ? "border-secondary ring-1 ring-secondary/20" : "border-outline-variant"}`}>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-colors ${cat === "Income Tax" ? "bg-blue-50 group-hover:bg-blue-100 text-blue-600" : cat === "GST Returns" ? "bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600" : cat === "Statutory Audit" ? "bg-amber-50 group-hover:bg-amber-100 text-amber-600" : "bg-purple-50 group-hover:bg-purple-100 text-purple-600"}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cat === "Income Tax" ? "account_balance" : cat === "GST Returns" ? "receipt_long" : cat === "Statutory Audit" ? "fact_check" : "corporate_fare"}
                  </span>
                </div>
                <h3 className="font-title-lg text-title-lg text-primary">{cat}</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{categoryStats[cat as keyof typeof categoryStats].count} Files • {formatSize(categoryStats[cat as keyof typeof categoryStats].size)}</p>
                <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
                  <div className={`h-full ${cat === "Income Tax" ? "bg-blue-500" : cat === "GST Returns" ? "bg-emerald-500" : cat === "Statutory Audit" ? "bg-amber-500" : "bg-purple-500"}`} style={{ width: categoryStats["All"].count > 0 ? `${(categoryStats[cat as keyof typeof categoryStats].count / categoryStats["All"].count) * 100}%` : "0%" }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-title-lg text-title-lg text-primary">Recent Uploads {activeCategory !== "All" && `(${activeCategory})`}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Client</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Flow</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {visibleDocuments.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">No documents found.</td></tr>
                  ) : (
                    visibleDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-blue-500">article</span>
                            <span className="font-body-md text-body-md text-primary font-medium">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface">{doc.client?.name || "Unknown"}</td>
                        <td className="px-6 py-4">
                          {doc.direction === "INWARD" && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">INWARD (From Client)</span>}
                          {doc.direction === "OUTWARD" && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">OUTWARD (To Client)</span>}
                          {doc.direction === "INTERNAL" && <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded font-bold">INTERNAL</span>}
                        </td>
                        <td className="px-6 py-4 font-body-md text-on-surface-variant">{new Date(doc.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a href={doc.url} download className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                              <span className="material-symbols-outlined text-xl">download</span>
                            </a>
                            {(currentUserRole === "ADMIN" || doc.userId === currentUserId) && (
                              <button onClick={(e) => handleDelete(doc.id, "DOC", e)} disabled={isDeleting === doc.id} className="p-1.5 text-error hover:bg-error-container rounded transition-colors cursor-pointer disabled:opacity-50">
                                <span className="material-symbols-outlined text-xl">delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB: DSC */}
      {activeTab === "DSC" && (
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg text-primary">Digital Signature Tracker</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Provider</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Expiry Date</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Password</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {dscs.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant">No DSCs tracked yet.</td></tr>
                ) : (
                  dscs.map((dsc) => {
                    const daysToExpiry = Math.ceil((new Date(dsc.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isExpiringSoon = daysToExpiry > 0 && daysToExpiry <= 30;
                    
                    return (
                      <tr key={dsc.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4 font-body-md text-on-surface font-bold">{dsc.client?.name || "Unknown"}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface">{dsc.providerName}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface">
                          {new Date(dsc.expiryDate).toLocaleDateString()}
                          {isExpiringSoon && <span className="ml-2 text-error text-xs font-bold animate-pulse">Expiring in {daysToExpiry} days</span>}
                        </td>
                        <td className="px-6 py-4">
                          {dsc.status === "ACTIVE" && <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded font-bold">ACTIVE</span>}
                          {dsc.status === "EXPIRED" && <span className="bg-error-container text-error text-xs px-2 py-1 rounded font-bold">EXPIRED</span>}
                          {dsc.status === "REVOKED" && <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded font-bold">REVOKED</span>}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {showPasswords[dsc.id] ? (dsc.password || "N/A") : "••••••••"}
                            </span>
                            {dsc.password && (
                              <button onClick={() => setShowPasswords(p => ({...p, [dsc.id]: !p[dsc.id]}))} className="text-on-surface-variant hover:text-primary cursor-pointer">
                                <span className="material-symbols-outlined text-sm">{showPasswords[dsc.id] ? "visibility_off" : "visibility"}</span>
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(currentUserRole === "ADMIN") && (
                            <button onClick={(e) => handleDelete(dsc.id, "DSC", e)} disabled={isDeleting === dsc.id} className="p-1 text-error hover:bg-error-container rounded transition-colors cursor-pointer">
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: UDIN */}
      {activeTab === "UDIN" && (
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg text-primary">UDIN Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">UDIN Number</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Document Type</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Generated Date</th>
                  <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {udins.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant">No UDINs generated yet.</td></tr>
                ) : (
                  udins.map((udin) => (
                    <tr key={udin.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-primary">{udin.udinNumber}</td>
                      <td className="px-6 py-4 font-body-md text-on-surface">{udin.client?.name || "Unknown"}</td>
                      <td className="px-6 py-4 font-body-md text-on-surface">{udin.documentType}</td>
                      <td className="px-6 py-4 font-body-md text-on-surface">{new Date(udin.generatedAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {(currentUserRole === "ADMIN") && (
                          <button onClick={(e) => handleDelete(udin.id, "UDIN", e)} disabled={isDeleting === udin.id} className="p-1 text-error hover:bg-error-container rounded transition-colors cursor-pointer">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-lg text-title-lg text-primary">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Document Name</label>
                <input type="text" name="name" required placeholder="e.g. FY 23-24 ITR Acknowledgment" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Client</label>
                <select name="clientId" required className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Document Flow (Direction)</label>
                <select name="direction" required defaultValue="INTERNAL" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="INTERNAL">Internal (Firm Only)</option>
                  <option value="INWARD">Inward (Received from Client)</option>
                  <option value="OUTWARD">Outward (Sent to Client)</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">File</label>
                <input type="file" name="file" required className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-container file:text-on-primary-container hover:file:bg-primary-container/80" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 text-primary font-bold hover:bg-surface-container rounded-lg cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {isUploading ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Upload"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create DSC Modal */}
      {isDscModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-lg text-title-lg text-primary">Track New DSC</h2>
              <button onClick={() => setIsDscModalOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateDsc} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Provider Name</label>
                <input type="text" name="providerName" required placeholder="e.g. e-Mudhra, Vsign" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Client</label>
                <select name="clientId" required className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Password / PIN (Optional)</label>
                <input type="text" name="password" placeholder="Will be hidden by default" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Issue Date</label>
                  <input type="date" name="issueDate" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">Expiry Date *</label>
                  <input type="date" name="expiryDate" required className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsDscModalOpen(false)} className="px-4 py-2 text-primary font-bold hover:bg-surface-container rounded-lg cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isCreatingDsc} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {isCreatingDsc ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Add DSC"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create UDIN Modal */}
      {isUdinModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-title-lg text-title-lg text-primary">Generate / Track UDIN</h2>
              <button onClick={() => setIsUdinModalOpen(false)} className="text-on-surface-variant hover:text-on-surface cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreateUdin} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">UDIN Number</label>
                <input type="text" name="udinNumber" required placeholder="e.g. 21012345AAAAAA1234" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono uppercase" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Client</label>
                <select name="clientId" required className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                  <option value="">Select a client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Document Type</label>
                <input type="text" name="documentType" required placeholder="e.g. Audit Report, Net Worth Certificate" className="w-full px-4 py-2 border border-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsUdinModalOpen(false)} className="px-4 py-2 text-primary font-bold hover:bg-surface-container rounded-lg cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isCreatingUdin} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2">
                  {isCreatingUdin ? <span className="material-symbols-outlined animate-spin">progress_activity</span> : "Save UDIN"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
