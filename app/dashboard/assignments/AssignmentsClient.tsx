"use client";

import { useState } from "react";
import Link from "next/link";

import { updateAssignmentStatus, exportAssignmentsCSV } from "@/lib/actions/assignment-actions";

export default function AssignmentsClient({ initialAssignments }: { initialAssignments: any[] }) {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [assignments, setAssignments] = useState<any[]>(initialAssignments);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportAssignmentsCSV();
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "assignments_export.csv";
      a.click();
    } catch(e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  // Group columns for Kanban
  const columns = [
    { title: "To Do", status: "TODO", border: "border-t-slate-400", bg: "bg-slate-50/50" },
    { title: "In Progress", status: "IN_PROGRESS", border: "border-t-blue-500", bg: "bg-blue-50/10" },
    { title: "In Review", status: "REVIEW", border: "border-t-amber-500", bg: "bg-amber-50/10" },
    { title: "Completed", status: "COMPLETED", border: "border-t-emerald-500", bg: "bg-emerald-50/10" }
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    // Firefox requires some data to be set for drag to work
    e.dataTransfer.setData("text/plain", id.toString()); 
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggedTaskId === null) return;
    
    // Optimistic Update
    setAssignments(prev => prev.map(task => {
      if (task.id === draggedTaskId) {
        return { ...task, status };
      }
      return task;
    }));
    
    // Server Action
    setUpdatingTaskId(draggedTaskId);
    try {
      await updateAssignmentStatus(draggedTaskId.toString(), status);
    } catch(e) {
      console.error(e);
      // Revert if error (omitted for brevity)
    } finally {
      setUpdatingTaskId(null);
    }

    setDraggedTaskId(null);
  };

  // Helper for UI
  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO": return "bg-surface-container-high text-on-surface-variant";
      case "IN_PROGRESS": return "bg-secondary-container text-on-secondary-container";
      case "REVIEW": return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      case "COMPLETED": return "bg-on-primary-fixed-variant text-secondary-fixed";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <>
      {/* Page Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <nav className="flex text-label-sm text-on-surface-variant gap-2 mb-2">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-primary font-bold">Assignments</span>
          </nav>
          <h2 className="font-display-lg text-display-lg text-primary">Assignment Board</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-surface-container-high p-1 rounded-lg">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 cursor-pointer transition-all ${
                view === "list"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span> List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 cursor-pointer transition-all ${
                view === "kanban"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-bold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span> Kanban
            </button>
          </div>
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${isFilterOpen ? 'border-primary text-primary bg-primary-container/10' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting} 
            className="flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer min-w-[100px]"
          >
            {isExporting ? (
              <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
            ) : (
              <><span className="material-symbols-outlined text-[18px]">download</span> Export</>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isFilterOpen && (
        <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm mb-8 animate-in fade-in flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary">
              <option>Anyone</option>
              <option>Sarah M.</option>
              <option>David R.</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
            <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary">
              <option>Anytime</option>
              <option>Next 7 Days</option>
              <option>Next 30 Days</option>
              <option>Overdue</option>
            </select>
          </div>
          <button className="mt-5 text-sm font-bold text-primary hover:underline cursor-pointer">Clear Filters</button>
        </div>
      )}

      {/* Dashboard Bento Grid Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-secondary">
          <p className="text-label-md text-on-surface-variant uppercase">Total Tasks</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">42</h3>
          <p className="text-label-sm text-secondary font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> 12% vs last month
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-on-tertiary-container">
          <p className="text-label-md text-on-surface-variant uppercase">In Progress</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">18</h3>
          <p className="text-label-sm text-on-surface-variant mt-2">6 assignments in Review</p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-error">
          <p className="text-label-md text-on-surface-variant uppercase">At Risk</p>
          <h3 className="font-headline-md text-headline-md text-error mt-1">05</h3>
          <p className="text-label-sm text-on-surface-variant mt-2">Due in less than 48h</p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-primary">
          <p className="text-label-md text-on-surface-variant uppercase">Utilization</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">84%</h3>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[84%]"></div>
          </div>
        </div>
      </div>

      {view === "list" ? (
        /* Task Table Section */
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-1/3">Assignment & Client</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Team</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Time Left</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {assignments.map((task) => (
                  <tr key={task.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-title-lg text-title-lg text-primary ${task.status === "COMPLETED" ? "text-opacity-50 line-through" : ""}`}>
                          {task.title}
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{task.client?.name || "No Client"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center -space-x-2">
                        {task.user ? (
                          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold bg-secondary-container text-on-secondary-container" title={task.user.name}>
                            {task.user.name.substring(0,2).toUpperCase()}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-500">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4">
                    <td className="px-6 py-4">
                      {task.status === "COMPLETED" ? (
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-tertiary-container text-base">check_circle</span>
                          <span className="font-body-md text-body-md font-bold text-on-tertiary-container">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-body-md text-body-md font-bold text-on-surface">
                            {task.progress}%
                          </span>
                          <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${task.progress}%` }}></div>
                          </div>
                        </div>
                      )}
                    </td>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => console.log("Task Actions Menu Opened")} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <p className="text-label-sm text-on-surface-variant">Showing 1 to 4 of 42 results</p>
            <div className="flex items-center gap-2">
              <button className="p-1 border border-outline-variant rounded hover:bg-surface-container transition-colors disabled:opacity-30 cursor-not-allowed" disabled>
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-label-md text-primary font-bold px-2">1</span>
              <button className="p-1 border border-outline-variant rounded hover:bg-surface-container transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Kanban Board Section */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 items-start">
          {columns.map((col) => {
            const tasksInColumn = assignments.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`rounded-xl border border-outline-variant/60 shadow-sm flex flex-col min-h-[450px] p-4 ${col.bg} transition-colors ${draggedTaskId ? 'hover:border-primary hover:bg-primary/5' : ''}`}
              >
                {/* Column Header */}
                <div className={`border-t-4 ${col.border} pt-2 pb-3 mb-4 flex justify-between items-center`}>
                  <h4 className="font-title-lg text-title-lg text-primary">{col.title}</h4>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold text-on-surface-variant">
                    {tasksInColumn.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                  {tasksInColumn.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center border-2 border-dashed border-outline-variant/50 rounded-lg p-6 text-center pointer-events-none">
                      <p className="text-label-sm text-on-surface-variant/60">Drop tasks here</p>
                    </div>
                  ) : (
                    tasksInColumn.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className={`bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group flex flex-col justify-between cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'opacity-50 border-dashed scale-95' : ''} ${updatingTaskId === task.id ? 'animate-pulse ring-2 ring-primary ring-offset-2' : ''}`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(task.status)}`}>
                              {task.status.replace("_", " ")}
                            </span>
                            <button onClick={() => console.log("Task details...")} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="material-symbols-outlined text-base">more_vert</span>
                            </button>
                          </div>
                          <h5 className={`font-title-lg text-title-lg text-primary mb-1 group-hover:text-primary-hover ${task.status === "COMPLETED" ? "text-opacity-50 line-through" : ""}`}>
                            {task.title}
                          </h5>
                          <p className="text-body-sm text-on-surface-variant mb-4">{task.client?.name || "No Client"}</p>
                        </div>

                        <div className="border-t border-outline-variant/40 pt-3 flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              <span className="text-[11px] font-medium">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}</span>
                            </div>

                            <div className="flex items-center -space-x-1.5">
                              {task.user ? (
                                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-secondary-container text-on-secondary-container" title={task.user.name}>
                                  {task.user.name.substring(0,2).toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-slate-200 text-slate-500">
                                  -
                                </div>
                              )}
                            </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Recent Activity / Upcoming Deadlines Floating Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-title-lg text-title-lg text-primary">Recent Activity</h4>
            <button className="text-secondary font-label-md text-label-md hover:underline cursor-pointer">View All</button>
          </div>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-2 bg-secondary rounded-full"></div>
              <div>
                <p className="text-body-md text-on-surface"><span className="font-bold">David R.</span> approved the draft for <span className="text-primary font-semibold">GST Audit - Client ABC</span></p>
                <p className="text-label-sm text-on-surface-variant">14 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 bg-on-primary-container rounded-full"></div>
              <div>
                <p className="text-body-md text-on-surface"><span className="font-bold">System</span> automatically updated status for <span className="text-primary font-semibold">Quantum Tech Filing</span> to <span className="font-bold text-secondary">Signed Off</span></p>
                <p className="text-label-sm text-on-surface-variant">2 hours ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 bg-error rounded-full"></div>
              <div>
                <p className="text-body-md text-on-surface"><span className="font-bold">Sarah M.</span> requested missing documents for <span className="text-primary font-semibold">Heritage Trust</span></p>
                <p className="text-label-sm text-on-surface-variant">Yesterday at 4:30 PM</p>
              </div>
            </div>
          </div>
        </div>
        {/* Priority Focus */}
        <div className="bg-primary text-on-primary rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-title-lg text-title-lg mb-2">Immediate Focus</h4>
            <p className="text-body-sm text-on-primary-container mb-6">You have 2 reviews pending that expire by end of day today.</p>
            <div className="space-y-3">
              <div className="p-3 bg-on-primary-fixed-variant rounded-lg border border-on-primary-container/30">
                <div className="flex justify-between items-start">
                  <span className="text-label-sm uppercase tracking-tighter opacity-80">Audit Review</span>
                  <span className="material-symbols-outlined text-secondary text-sm">priority_high</span>
                </div>
                <h5 className="text-body-md font-bold mt-1">Apex Solutions - ITR</h5>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-secondary-container"></div>
                  </div>
                  <span className="text-label-sm">Sarah M. waiting</span>
                </div>
              </div>
            </div>
            <button onClick={() => console.log("Review portal...")} className="w-full mt-6 py-2 border border-secondary text-secondary font-label-md text-label-md rounded hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">
              Open Review Portal
            </button>
          </div>
          {/* Decorative Pattern inside card */}
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="20" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
}
