"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type DashboardAssignment = {
  id: string;
  title: string;
  status: string;
  priority: string;
  client?: { name?: string | null } | null;
  user?: { name?: string | null } | null;
};

type DashboardDeadline = {
  id: string;
  title: string;
  priority: string;
  deadline: string | Date;
  client?: { name?: string | null } | null;
};

type DashboardMetrics = {
  activeAssignments: number;
  totalAssignments: number;
};

type DashboardHistoryItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | Date | null;
  createdAt: string | Date;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string;
};

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
        <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
        <div className="space-y-1">
          <p className="text-xs text-[#005c53] font-bold">
            Actual: {payload[0].value}L
          </p>
          <p className="text-xs text-slate-400 font-bold">
            Target: {payload[1].value}L
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function DashboardClient({ recentAssignments, upcomingDeadlines, allAssignments, metrics }: { recentAssignments: DashboardAssignment[]; upcomingDeadlines: DashboardDeadline[]; allAssignments: DashboardHistoryItem[]; metrics: DashboardMetrics }) {
  const router = useRouter();
  const [chartPeriod, setChartPeriod] = useState("6");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoadingCRM, setIsLoadingCRM] = useState(false);
  
  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGeneratingPDF(false);
    router.push("/dashboard/billing");
  };

  const handleLoadCRM = async () => {
    setIsLoadingCRM(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsLoadingCRM(false);
    router.push("/dashboard/clients");
  };

  const currentChartData = useMemo(() => {
    const referenceDate = new Date();
    const monthsBack = chartPeriod === "6" ? 6 : 12;
    const entries: Array<{ name: string; actual: number; target: number }> = [];

    for (let offset = monthsBack - 1; offset >= 0; offset -= 1) {
      const monthDate = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
      const monthIndex = monthDate.getMonth();
      const year = monthDate.getFullYear();
      const label = monthDate.toLocaleString("default", { month: "short" }).toUpperCase();

      const monthlyAssignments = allAssignments.filter((assignment) => {
        const sourceDate = new Date(assignment.deadline || assignment.createdAt);
        return sourceDate.getMonth() === monthIndex && sourceDate.getFullYear() === year;
      });

      const actual = monthlyAssignments.filter((assignment) => assignment.status === "COMPLETED").length;
      const target = monthlyAssignments.length;
      entries.push({ name: label, actual, target });
    }

    return entries;
  }, [chartPeriod, allAssignments]);

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h2 className="font-headline-md text-[28px] font-bold text-slate-900 leading-tight">Firm Overview</h2>
          <p className="text-slate-500 font-body-md mt-1">Good morning, here&apos;s what&apos;s happening at the practice today.</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-2 border border-green-100">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Updates
          </span>
        </div>
      </div>

      {/* Redesigned Top Section: Metrics + Billing Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Billing Performance Chart (Prominent) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 flex flex-col shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Monthly Billing vs. Target</h3>
              <p className="text-slate-400 text-xs mt-1 font-medium">Fiscal Year 2024-25 Performance</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-[#005c53] rounded-full"></span> Actual</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-200 rounded-full"></span> Target</div>
              <select 
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs py-1.5 pl-3 pr-8 focus:outline-none focus:border-[#005c53] cursor-pointer text-slate-700 normal-case"
              >
                <option value="6">Last 6 Months</option>
                <option value="12">Last 12 Months</option>
              </select>
            </div>
          </div>
          
          <div className="flex-1 w-full h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={2}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="actual" fill="#005c53" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1500} />
                <Bar dataKey="target" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Total Billing (YTD)</p>
                <p className="text-xl font-bold text-slate-900">₹72.4L</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Achievement</p>
                <p className="text-xl font-bold text-[#005c53]">92.4%</p>
              </div>
            </div>
            <button 
              onClick={handleGeneratePDF} 
              disabled={isGeneratingPDF}
              className={`font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer ${isGeneratingPDF ? "text-slate-400" : "text-[#005c53] hover:underline"}`}
            >
              {isGeneratingPDF ? (
                <>Generating... <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span></>
              ) : (
                <>Export Report <span className="material-symbols-outlined text-[18px]">download</span></>
              )}
            </button>
          </div>
        </div>

        {/* High Level Metrics (Stacked in 1/3 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-5 hover:shadow-md transition-shadow shadow-sm cursor-pointer" onClick={() => router.push("/dashboard/assignments")}>
            <span className="w-12 h-12 flex items-center justify-center bg-teal-50 text-teal-600 rounded-xl material-symbols-outlined text-2xl border border-teal-100">work</span>
            <div>
              <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Active Assignments</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{metrics.activeAssignments}</p>
                <span className="text-teal-600 font-bold text-xs bg-teal-50 px-1.5 py-0.5 rounded">Total: {metrics.totalAssignments}</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-5 hover:shadow-md transition-shadow shadow-sm cursor-pointer" onClick={() => router.push("/dashboard/calendar")}>
            <span className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl material-symbols-outlined text-2xl border border-red-100">event_busy</span>
            <div>
              <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">7-Day Deadlines</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">{upcomingDeadlines.length}</p>
                <span className="text-red-500 font-bold text-xs bg-red-50 px-1.5 py-0.5 rounded">High Priority</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-5 hover:shadow-md transition-shadow shadow-sm cursor-pointer">
            <span className="w-12 h-12 flex items-center justify-center bg-slate-100 text-slate-700 rounded-xl material-symbols-outlined text-2xl border border-slate-200">payments</span>
            <div>
              <h3 className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Firm Billables</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">₹18.4L</p>
                <span className="text-slate-500 font-bold text-xs">This Month</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Assignments Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-base">Recent Assignments</h3>
            <button onClick={() => router.push("/dashboard/assignments")} className="text-[#005c53] font-semibold text-sm hover:underline cursor-pointer">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Client / Task</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Staff</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => router.push("/dashboard/assignments")}>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-slate-900">{assignment.client?.name || "No Client"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{assignment.title}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        {assignment.user ? (
                          <>
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-indigo-200">{(assignment.user.name ?? "UN").substring(0,2).toUpperCase()}</div>
                            <span className="text-xs font-medium text-slate-700">{assignment.user.name ?? "Unassigned"}</span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold rounded uppercase tracking-wider">{assignment.status.replace("_", " ")}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`flex items-center gap-1.5 ${assignment.priority === 'HIGH' ? 'text-red-500' : 'text-slate-400'}`}>
                        <span className="material-symbols-outlined text-[16px]">priority_high</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{assignment.priority}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compliance Calendar Widget */}
        <div className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-base">Upcoming Deadlines</h3>
            <button onClick={() => router.push("/dashboard/calendar")} className="material-symbols-outlined text-slate-400 hover:text-[#005c53] transition-colors cursor-pointer text-[20px]">calendar_month</button>
          </div>
          <div className="p-5 space-y-5 flex-1 custom-scrollbar overflow-y-auto">
              {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No upcoming deadlines.</p>
            ) : (
                upcomingDeadlines.map((deadline) => {
                const date = new Date(deadline.deadline);
                const month = date.toLocaleString('default', { month: 'short' }).toUpperCase();
                const day = date.getDate().toString().padStart(2, '0');
                
                return (
                  <div key={deadline.id} className="flex gap-4 items-start group cursor-pointer" onClick={() => router.push("/dashboard/calendar")}>
                    <div className="flex flex-col items-center min-w-[50px] p-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider">{month}</span>
                      <span className="text-xl font-extrabold leading-none mt-1">{day}</span>
                    </div>
                    <div className="flex-1 pt-0.5">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#005c53] transition-colors">{deadline.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{deadline.client?.name}</p>
                      {deadline.priority === 'HIGH' && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded">Critical</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Workload & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Staff Workload Distribution */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 text-base">Staff Workload Distribution</h3>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#005c53] rounded-full"></span> Active</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#008f81] rounded-full"></span> Review</div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-100 rounded-full border border-slate-200"></span> Capacity</div>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-900">Rohan K. <span className="text-slate-400 font-medium">(Team Lead)</span></span>
                <span className="text-slate-500 font-bold">92%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                <div className="h-full bg-[#005c53]" style={{ width: "70%" }}></div>
                <div className="h-full bg-[#008f81]" style={{ width: "22%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-900">Sneha J. <span className="text-slate-400 font-medium">(Senior Associate)</span></span>
                <span className="text-slate-500 font-bold">65%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                <div className="h-full bg-[#005c53]" style={{ width: "45%" }}></div>
                <div className="h-full bg-[#008f81]" style={{ width: "20%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-900">Divya S. <span className="text-slate-400 font-medium">(Associate)</span></span>
                <span className="text-slate-500 font-bold">88%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                <div className="h-full bg-[#005c53]" style={{ width: "60%" }}></div>
                <div className="h-full bg-[#008f81]" style={{ width: "28%" }}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <button onClick={() => router.push("/dashboard/assignments")} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group shadow-sm cursor-pointer">
            <span className="w-10 h-10 flex items-center justify-center bg-teal-50 text-teal-600 rounded-lg group-hover:bg-[#005c53] group-hover:text-white transition-colors material-symbols-outlined">add_task</span>
            <div className="text-left">
              <p className="font-bold text-sm text-slate-900">New Assignment</p>
              <p className="text-xs text-slate-500 mt-0.5">Initialize a new task</p>
            </div>
          </button>
          
          <button onClick={() => router.push("/dashboard/clients")} className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all group shadow-sm cursor-pointer">
            <span className="w-10 h-10 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors material-symbols-outlined">person_add</span>
            <div className="text-left">
              <p className="font-bold text-sm text-slate-900">Add Client</p>
              <p className="text-xs text-slate-500 mt-0.5">Onboard new profile</p>
            </div>
          </button>
          
          <div className="mt-6 p-5 bg-[#005c53] rounded-xl text-white shadow-md relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-sm mb-1">Practice Growth</h4>
              <p className="text-xs text-teal-100 mb-4 leading-relaxed">You have 12 new leads since Monday.</p>
              <button 
                onClick={handleLoadCRM} 
                disabled={isLoadingCRM}
                className="w-full py-2.5 bg-white text-[#005c53] flex items-center justify-center gap-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoadingCRM ? (
                  <>Loading... <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span></>
                ) : (
                  "Review Leads"
                )}
              </button>
            </div>
            {/* Decorative SVG */}
            <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
              <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
                <circle cx="80" cy="80" r="60" stroke="currentColor" strokeWidth="15" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
