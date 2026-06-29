import Image from "next/image";

export default function StaffManagementPage() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Page Header & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary">Staff Management</h3>
          <p className="font-body-md text-on-surface-variant">Manage team bandwidth, monitor efficiency, and allocate assignments.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
            <div className="p-2 bg-secondary-container rounded-full">
              <span className="material-symbols-outlined text-on-secondary-container">trending_up</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">Avg. Efficiency</p>
              <p className="font-title-lg text-title-lg text-primary">92.4%</p>
            </div>
          </div>
          <div className="bg-surface border border-outline-variant p-4 rounded-lg flex items-center gap-4">
            <div className="p-2 bg-tertiary-fixed rounded-full">
              <span className="material-symbols-outlined text-on-tertiary-fixed">group</span>
            </div>
            <div>
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">Total Capacity</p>
              <p className="font-title-lg text-title-lg text-primary">78/110</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Staff Directory (Large Bento Card) */}
        <div className="col-span-12 lg:col-span-8 bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex gap-4">
              <button className="font-label-md text-label-md py-1 border-b-2 border-secondary text-primary cursor-pointer">All Team</button>
              <button className="font-label-md text-label-md py-1 text-on-surface-variant hover:text-primary cursor-pointer">Partners</button>
              <button className="font-label-md text-label-md py-1 text-on-surface-variant hover:text-primary cursor-pointer">Managers</button>
              <button className="font-label-md text-label-md py-1 text-on-surface-variant hover:text-primary cursor-pointer">Associates</button>
            </div>
            <button className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="font-label-md text-label-md">Filters</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low">
                <tr className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Staff Member</th>
                  <th className="px-6 py-4 font-semibold text-center">Active</th>
                  <th className="px-6 py-4 font-semibold">Efficiency</th>
                  <th className="px-6 py-4 font-semibold">Capacity</th>
                  <th className="px-6 py-4 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {/* Row 1 */}
                <tr className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold">JD</div>
                      <div>
                        <p className="font-label-md text-primary">Jameson Davies</p>
                        <p className="font-label-sm text-on-surface-variant">Senior Manager</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">12</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-tertiary-container">98%</span>
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-tertiary-container w-[98%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                        <span>85% LOAD</span>
                        <span className="text-error">CRITICAL</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-error w-[85%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">more_vert</button>
                  </td>
                </tr>
                {/* Row 2 */}
                <tr className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full object-cover" alt="Sarah Chen" src="/images/img-11.jpg"/>
                      <div>
                        <p className="font-label-md text-primary">Sarah Chen</p>
                        <p className="font-label-sm text-on-surface-variant">Audit Associate</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary font-bold text-xs">4</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-tertiary-container">84%</span>
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-tertiary-container w-[84%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                        <span>30% LOAD</span>
                        <span className="text-secondary">AVAILABLE</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary w-[30%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">more_vert</button>
                  </td>
                </tr>
                {/* Row 3 */}
                <tr className="hover:bg-surface-container-lowest transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-bold">MK</div>
                      <div>
                        <p className="font-label-md text-primary">Marcus Knight</p>
                        <p className="font-label-sm text-on-surface-variant">Tax Partner</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">22</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-tertiary-container">91%</span>
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-tertiary-container w-[91%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                        <span>65% LOAD</span>
                        <span className="text-on-secondary-container">STABLE</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-secondary-container w-[65%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">more_vert</button>
                  </td>
                </tr>
                {/* Row 4 */}
                <tr className="hover:bg-surface-container-lowest transition-colors group border-b-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img className="w-10 h-10 rounded-full object-cover" alt="Elena Rodriguez" src="/images/img-12.jpg"/>
                      <div>
                        <p className="font-label-md text-primary">Elena Rodriguez</p>
                        <p className="font-label-sm text-on-surface-variant">Compliance Manager</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary font-bold text-xs">8</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-on-tertiary-container">89%</span>
                      <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-tertiary-container w-[89%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                        <span>50% LOAD</span>
                        <span className="text-on-secondary-container">AVAILABLE</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-on-secondary-container w-[50%]"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">more_vert</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Allocations (Side Panel) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">assignment_late</span>
            </div>
            <h4 className="font-title-lg text-title-lg text-primary mb-4">Pending Allocations</h4>
            <div className="space-y-4">
              {/* Allocation Card 1 */}
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant hover:border-secondary transition-all cursor-move">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Urgent</span>
                    <h5 className="font-label-md text-primary mt-1">Audit: TechCorp Inc.</h5>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">drag_indicator</span>
                </div>
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
                  <span>Deadline: Oct 24</span>
                  <span>Est. 40 hrs</span>
                </div>
                <button className="w-full mt-3 py-1.5 border border-secondary text-secondary rounded font-label-md hover:bg-secondary hover:text-white transition-all cursor-pointer">Quick Assign</button>
              </div>
              {/* Allocation Card 2 */}
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant hover:border-secondary transition-all cursor-move">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="bg-surface-container-highest text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Standard</span>
                    <h5 className="font-label-md text-primary mt-1">GST Filing - Q3</h5>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">drag_indicator</span>
                </div>
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
                  <span>Deadline: Nov 10</span>
                  <span>Est. 12 hrs</span>
                </div>
                <button className="w-full mt-3 py-1.5 border border-secondary text-secondary rounded font-label-md hover:bg-secondary hover:text-white transition-all cursor-pointer">Quick Assign</button>
              </div>
              {/* Allocation Card 3 */}
              <div className="p-4 bg-surface-container rounded-lg border border-outline-variant hover:border-secondary transition-all cursor-move">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="bg-surface-container-highest text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Standard</span>
                    <h5 className="font-label-md text-primary mt-1">Annual Tax: Global Ltd.</h5>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant">drag_indicator</span>
                </div>
                <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
                  <span>Deadline: Nov 15</span>
                  <span>Est. 60 hrs</span>
                </div>
                <button className="w-full mt-3 py-1.5 border border-secondary text-secondary rounded font-label-md hover:bg-secondary hover:text-white transition-all cursor-pointer">Quick Assign</button>
              </div>
            </div>
            <button className="w-full mt-6 text-on-surface-variant hover:text-primary font-label-md flex items-center justify-center gap-1 transition-colors cursor-pointer">
              View all pending tasks
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          {/* Capacity Map / Analytics */}
          <div className="bg-primary-container text-surface-bright rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-title-lg text-title-lg mb-4">Workload Distribution</h4>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle className="text-white/10" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8"></circle>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
