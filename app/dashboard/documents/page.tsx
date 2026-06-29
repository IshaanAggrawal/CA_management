export default function DocumentsPage() {
  return (
    <>
      {/* Action Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="font-display-lg text-display-lg text-primary">Document Vault</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Secure repository for all client compliance and audit evidence.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-secondary text-secondary font-bold rounded-lg hover:bg-secondary-container transition-all active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined">mark_email_read</span>
            Request Documents
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-secondary text-white font-bold rounded-lg hover:brightness-110 shadow-md transition-all active:opacity-80 cursor-pointer">
            <span className="material-symbols-outlined">upload</span>
            Upload Files
          </button>
        </div>
      </div>

      {/* Bento Grid for Categories */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Income Tax */}
        <div className="bg-white border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <span className="material-symbols-outlined text-blue-600" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Income Tax</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">1,240 Files • 4.2 GB</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: "65%" }}></div>
          </div>
        </div>

        {/* GST Compliance */}
        <div className="bg-white border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-100 transition-colors">
            <span className="material-symbols-outlined text-emerald-600" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">GST Returns</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">856 Files • 2.8 GB</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: "42%" }}></div>
          </div>
        </div>

        {/* Audit Evidence */}
        <div className="bg-white border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-100 transition-colors">
            <span className="material-symbols-outlined text-amber-600" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Statutory Audit</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">432 Files • 1.5 GB</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-amber-500" style={{ width: "88%" }}></div>
          </div>
        </div>

        {/* Incorporation */}
        <div className="bg-white border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group cursor-pointer">
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <span className="material-symbols-outlined text-purple-600" style={{ fontVariationSettings: "'FILL' 1" }}>corporate_fare</span>
          </div>
          <h3 className="font-title-lg text-title-lg text-primary">Incorporation</h3>
          <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">128 Files • 850 MB</p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: "30%" }}></div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-lg text-title-lg text-primary">Recent Uploads</h3>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
            </button>
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-colors cursor-pointer">
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
              {/* Row 1 */}
              <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    <span className="font-body-md text-body-md text-primary font-medium">FY23_BalanceSheet_Draft.pdf</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface">Acme Corp Ltd.</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Audit</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Oct 24, 2023</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">2.4 MB</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full uppercase tracking-tight">Review Pending</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
              {/* Row 2 */}
              <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-emerald-500">description</span>
                    <span className="font-body-md text-body-md text-primary font-medium">GST_Monthly_Summary_Sept.xlsx</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface">Global Tech Sol.</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">GST</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Oct 23, 2023</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">1.1 MB</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-tight">Signed</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
              {/* Row 3 */}
              <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-red-500">picture_as_pdf</span>
                    <span className="font-body-md text-body-md text-primary font-medium">Form_16_A_Client_882.pdf</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface">Sarah Jenkins</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Income Tax</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Oct 22, 2023</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">450 KB</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full uppercase tracking-tight">Signed</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
              {/* Row 4 */}
              <tr className="hover:bg-surface-container-lowest transition-colors cursor-pointer">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-blue-500">article</span>
                    <span className="font-body-md text-body-md text-primary font-medium">Memorandum_of_Association.pdf</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface">Nexus Ventures</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Incorporation</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">Oct 21, 2023</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">3.8 MB</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full uppercase tracking-tight">Review Pending</span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-on-surface-variant hover:text-secondary"><span className="material-symbols-outlined">more_vert</span></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Showing 4 of 240 files</span>
          <div className="flex gap-4">
            <button className="px-3 py-1 border border-outline-variant rounded bg-white text-on-surface-variant hover:bg-surface-container disabled:opacity-50 cursor-not-allowed" disabled>Previous</button>
            <button className="px-3 py-1 border border-outline-variant rounded bg-white text-on-surface-variant hover:bg-surface-container cursor-pointer">Next</button>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button (FAB) - Contextual for Document View */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-secondary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-50 md:hidden cursor-pointer">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>
      
      {/* Visual Polish: Decorative Background Element */}
      <div className="fixed top-0 right-0 -z-10 opacity-10 pointer-events-none">
        <svg fill="none" height="600" viewBox="0 0 600 600" width="600" xmlns="http://www.w3.org/2000/svg">
          <circle cx="450" cy="150" fill="#006a61" r="150"></circle>
          <path d="M0 600C0 268.629 268.629 0 600 0" stroke="#1b2b48" strokeWidth="2"></path>
        </svg>
      </div>
    </>
  );
}
