"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { uploadDocument, deleteDocument } from "@/lib/actions/document-actions";

type PrismaDocument = {
  id: string;
  name: string;
  url: string;
  size: number | null;
  createdAt: Date;
  client?: { name: string };
  userId?: string | null;
};

type Client = {
  id: string;
  name: string;
};

type DocumentCategory = "All" | "Income Tax" | "GST Returns" | "Statutory Audit" | "Incorporation";

export default function DocumentsClient({
  documents = [],
  clients = [],
  currentUserRole,
  currentUserId
}: {
  documents: PrismaDocument[],
  clients: Client[],
  currentUserRole: string,
  currentUserId: string
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<DocumentCategory>("All");
  const [sortNewest, setSortNewest] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;
    setIsDeleting(id);
    try {
      await deleteDocument(id);
    } catch (err: any) {
      alert(err.message || "Failed to delete document");
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Document Vault</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Secure repository for all client compliance and audit evidence.</p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard/support")} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-secondary text-secondary font-bold rounded-lg hover:bg-secondary-container transition-all active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined">mark_email_read</span>
            Request Documents
          </button>
          <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined">upload</span>
            Upload Files
          </button>
        </div>
      </div>

      {/* Bento Grid for Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Income Tax */}
        <div onClick={() => setActiveCategory("Income Tax")} className={`bg-white border p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer ${activeCategory === "Income Tax" ? "border-secondary ring-1 ring-secondary/20" : "border-outline-variant"}`}>
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Income Tax</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{categoryStats["Income Tax"].count} Files • {formatSize(categoryStats["Income Tax"].size)}</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: categoryStats["All"].count > 0 ? `${(categoryStats["Income Tax"].count / categoryStats["All"].count) * 100}%` : "0%" }}></div>
          </div>
        </div>

        {/* GST Compliance */}
        <div onClick={() => setActiveCategory("GST Returns")} className={`bg-white border p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer ${activeCategory === "GST Returns" ? "border-secondary ring-1 ring-secondary/20" : "border-outline-variant"}`}>
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">GST Returns</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{categoryStats["GST Returns"].count} Files • {formatSize(categoryStats["GST Returns"].size)}</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: categoryStats["All"].count > 0 ? `${(categoryStats["GST Returns"].count / categoryStats["All"].count) * 100}%` : "0%" }}></div>
          </div>
        </div>

        {/* Audit Evidence */}
        <div onClick={() => setActiveCategory("Statutory Audit")} className={`bg-white border p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer ${activeCategory === "Statutory Audit" ? "border-secondary ring-1 ring-secondary/20" : "border-outline-variant"}`}>
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Statutory Audit</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{categoryStats["Statutory Audit"].count} Files • {formatSize(categoryStats["Statutory Audit"].size)}</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: categoryStats["All"].count > 0 ? `${(categoryStats["Statutory Audit"].count / categoryStats["All"].count) * 100}%` : "0%" }}></div>
          </div>
        </div>

        {/* Incorporation */}
        <div onClick={() => setActiveCategory("Incorporation")} className={`bg-white border p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer ${activeCategory === "Incorporation" ? "border-secondary ring-1 ring-secondary/20" : "border-outline-variant"}`}>
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <span className="material-symbols-outlined text-purple-600" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Incorporation</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">{categoryStats["Incorporation"].count} Files • {formatSize(categoryStats["Incorporation"].size)}</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: categoryStats["All"].count > 0 ? `${(categoryStats["Incorporation"].count / categoryStats["All"].count) * 100}%` : "0%" }}></div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-primary">Recent Uploads</h3>
          <div className="flex gap-2">
            <button onClick={() => router.push("/dashboard/search?q=document%20filters")} className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            </button>
            <button onClick={() => setSortNewest((value) => !value)} className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">sort</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-on-surface-variant font-label-md">No documents found for {activeCategory.toLowerCase()}.</td>
                </tr>
              ) : (
                visibleDocuments.map((doc) => (
                  <tr key={doc.id} onClick={() => router.push(`/dashboard/search?q=${encodeURIComponent(doc.name)}`)} className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="material-symbols-outlined text-blue-500">article</span>
                        <span className="font-body-md text-body-md text-primary font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface">{doc.client?.name || "Unknown"}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{activeCategory === "All" ? "Uncategorized" : activeCategory}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "-"}</td>
                    <td className="px-6 py-4">
                      <a href={doc.url} target="_blank" onClick={(e) => e.stopPropagation()} className="px-2 py-1 bg-teal-100 text-teal-800 text-[11px] font-bold rounded-full uppercase tracking-tight">View File</a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <a href={doc.url} download onClick={(e) => e.stopPropagation()} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                          <span className="material-symbols-outlined text-xl">download</span>
                        </a>
                        {(currentUserRole === "ADMIN" || doc.userId === currentUserId) && (
                          <button onClick={(e) => handleDelete(doc.id, e)} disabled={isDeleting === doc.id} className="p-1.5 text-error hover:bg-error-container rounded transition-colors cursor-pointer disabled:opacity-50">
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
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing {visibleDocuments.length} of {documents.length} files</span>
          <div className="flex gap-4">
            <button onClick={() => router.push("/dashboard/search?q=documents")} className="px-3 py-1 border border-outline-variant rounded bg-white text-on-surface-variant hover:bg-surface-container disabled:opacity-50 cursor-pointer">Previous</button>
            <button onClick={() => router.push("/dashboard/search?q=documents&page=2")} className="px-3 py-1 border border-outline-variant rounded bg-white text-on-surface-variant hover:bg-surface-container cursor-pointer">Next</button>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) - Contextual for Document View */}
      <button onClick={() => router.push("/dashboard/support?intent=upload")} className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 md:hidden cursor-pointer">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Visual Polish: Decorative Background Element */}
      <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <svg fill="none" height="600" viewBox="0 0 600 600" width="600" xmlns="http://www.w3.org/2000/svg">
          <circle cx="450" cy="150" fill="#006a61" r="150"></circle>
          <path d="M0 600C0 268.629 268.629 0 600 0" stroke="#1b2b48" strokeWidth="2"></path>
        </svg>
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="text-xl font-bold text-primary">Upload Document</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface">Client</label>
                <select name="clientId" required className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface">
                  <option value="">Select a client...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface">Document Name</label>
                <input type="text" name="name" required placeholder="e.g. FY23_Q2_GST.pdf" className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-on-surface">File (Mock Upload)</label>
                <input type="file" name="file" required className="w-full px-3 py-2 border border-outline-variant rounded-md bg-surface-container-lowest text-on-surface" />
                <p className="text-xs text-on-surface-variant italic">Note: File is not actually uploaded to a real CDN yet. A fake URL will be saved.</p>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsUploadModalOpen(false)} className="px-4 py-2 border border-outline-variant text-on-surface-variant rounded-md hover:bg-surface-container transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={isUploading} className="px-4 py-2 bg-secondary text-white rounded-md font-semibold shadow hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer">
                  {isUploading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
