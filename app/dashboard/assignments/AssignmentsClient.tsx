"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAssignment, exportAssignmentsCSV, updateAssignmentStatus, deleteAssignment } from "@/lib/actions/assignment-actions";

type AssignmentStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
type AssignmentPriority = "LOW" | "MEDIUM" | "HIGH";

type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
  status: AssignmentStatus;
  priority: AssignmentPriority;
  deadline: string | Date | null;
  client: { id: string; name: string };
  user: { id: string; name: string } | null;
};

type AssignmentClientOption = { id: string; name: string };
type AssignmentUserOption = { id: string; name: string };

type ActivityLog = {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  user?: { name: string } | null;
};

type AssignmentsClientProps = {
  initialAssignments: AssignmentRow[];
  clients: AssignmentClientOption[];
  users: AssignmentUserOption[];
  initialLogs?: ActivityLog[];
};

const columns: Array<{ title: string; status: AssignmentStatus; border: string; bg: string }> = [
  { title: "To Do", status: "TODO", border: "border-t-slate-400", bg: "bg-slate-50/50" },
  { title: "In Progress", status: "IN_PROGRESS", border: "border-t-blue-500", bg: "bg-blue-50/10" },
  { title: "In Review", status: "REVIEW", border: "border-t-amber-500", bg: "bg-amber-50/10" },
  { title: "Completed", status: "COMPLETED", border: "border-t-emerald-500", bg: "bg-emerald-50/10" },
];

type FilterMode = "ALL" | "TODAY" | "NEXT_7_DAYS" | "OVERDUE";

export default function AssignmentsClient({ initialAssignments, clients, users, initialLogs = [] }: AssignmentsClientProps) {
  const router = useRouter();
  const [now] = useState(() => Date.now());
  const [view, setView] = useState<"list" | "kanban" | "activity">("kanban");
  const [assignments, setAssignments] = useState<AssignmentRow[]>(initialAssignments);
  const [logs, setLogs] = useState<ActivityLog[]>(initialLogs);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Auto-polling for real-time updates
  useEffect(() => {
    setAssignments(initialAssignments);
    setLogs(initialLogs);
  }, [initialAssignments, initialLogs]);

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [router]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<AssignmentStatus | "ALL">("ALL");
  const [selectedAssignee, setSelectedAssignee] = useState("ALL");
  const [dueFilter, setDueFilter] = useState<FilterMode>("ALL");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const getProgress = (status: AssignmentStatus) => {
    switch (status) {
      case "TODO":
        return 10;
      case "IN_PROGRESS":
        return 50;
      case "REVIEW":
        return 75;
      case "COMPLETED":
        return 100;
      default:
        return 0;
    }
  };

  const getTimeLeftLabel = (deadline: string | Date | null) => {
    if (!deadline) return "No deadline";
    const targetDate = new Date(deadline);
    const differenceInDays = Math.ceil((targetDate.getTime() - now) / (1000 * 60 * 60 * 24));

    if (differenceInDays < 0) return `${Math.abs(differenceInDays)}d overdue`;
    if (differenceInDays === 0) return "Due today";
    if (differenceInDays === 1) return "1 day left";
    return `${differenceInDays} days left`;
  };

  const getStatusColor = (status: AssignmentStatus) => {
    switch (status) {
      case "TODO":
        return "bg-surface-container-high text-on-surface-variant";
      case "IN_PROGRESS":
        return "bg-secondary-container text-on-secondary-container";
      case "REVIEW":
        return "bg-tertiary-fixed text-on-tertiary-fixed-variant";
      case "COMPLETED":
        return "bg-on-primary-fixed-variant text-secondary-fixed";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const searchHaystack = [assignment.title, assignment.description, assignment.client.name, assignment.user?.name]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    const matchesSearch = searchHaystack.includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "ALL" || assignment.status === selectedStatus;
    const matchesAssignee = selectedAssignee === "ALL" || assignment.user?.id === selectedAssignee;

    const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;
    const isOverdue = deadlineDate ? deadlineDate.getTime() < now && assignment.status !== "COMPLETED" : false;
    const isToday = deadlineDate ? deadlineDate.toDateString() === new Date().toDateString() : false;
    const next7Days = deadlineDate
      ? deadlineDate.getTime() >= now && deadlineDate.getTime() <= now + 7 * 24 * 60 * 60 * 1000
      : false;

    const matchesDueFilter =
      dueFilter === "ALL" ||
      (dueFilter === "TODAY" && isToday) ||
      (dueFilter === "NEXT_7_DAYS" && next7Days) ||
      (dueFilter === "OVERDUE" && isOverdue);

    return matchesSearch && matchesStatus && matchesAssignee && matchesDueFilter;
  });

  const taskCounts = {
    total: assignments.length,
    inProgress: assignments.filter((assignment) => assignment.status === "IN_PROGRESS").length,
    overdue: assignments.filter((assignment) => {
      if (!assignment.deadline) return false;
      return new Date(assignment.deadline).getTime() < now && assignment.status !== "COMPLETED";
    }).length,
    completed: assignments.filter((assignment) => assignment.status === "COMPLETED").length,
  };

  const utilization = users.length > 0 ? Math.min(Math.round((assignments.filter((assignment) => assignment.user).length / (users.length * 20)) * 100), 100) : 0;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportAssignmentsCSV();
      const blob = new Blob([csvData], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "assignments_export.csv";
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDrop = async (event: React.DragEvent, status: AssignmentStatus) => {
    event.preventDefault();
    if (!draggedTaskId) return;

    const previousAssignments = assignments;
    setAssignments((currentAssignments) => currentAssignments.map((assignment) => (assignment.id === draggedTaskId ? { ...assignment, status } : assignment)));
    setUpdatingTaskId(draggedTaskId);

    try {
      await updateAssignmentStatus(draggedTaskId, status);
    } catch (error) {
      console.error(error);
      setAssignments(previousAssignments);
    } finally {
      setDraggedTaskId(null);
      setUpdatingTaskId(null);
    }
  };

  const handleCreateAssignment = async (formData: FormData) => {
    setIsSaving(true);
    try {
      await createAssignment(formData);
      setIsCreateOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(null);
      setMenuOpenId(null);
    }
  };

  return (
    <div className="space-y-6">
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
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 cursor-pointer transition-all ${view === "list" ? "bg-surface-container-lowest text-primary shadow-sm font-bold" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[18px]">view_list</span> List
            </button>
            <button
              onClick={() => setView("kanban")}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 cursor-pointer transition-all ${view === "kanban" ? "bg-surface-container-lowest text-primary shadow-sm font-bold" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[18px]">view_kanban</span> Kanban
            </button>
            <button
              onClick={() => setView("activity")}
              className={`px-3 py-1.5 rounded-md font-label-md text-label-md flex items-center gap-2 cursor-pointer transition-all ${view === "activity" ? "bg-surface-container-lowest text-primary shadow-sm font-bold" : "text-on-surface-variant hover:text-primary"}`}
            >
              <span className="material-symbols-outlined text-[18px]">history</span> Activity
            </button>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-label-md text-label-md transition-colors cursor-pointer ${isFilterOpen ? "border-primary text-primary bg-primary-container/10" : "border-outline-variant text-on-surface-variant hover:bg-surface-container"}`}
          >
            <span className="material-symbols-outlined text-[18px]">filter_list</span> Filters
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer min-w-[100px]"
          >
            {isExporting ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> : <><span className="material-symbols-outlined text-[18px]">download</span> Export</>}
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> New Assignment
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm mb-8 animate-in fade-in flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1 w-full md:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Search</label>
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Task, client, assignee..."
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value as AssignmentStatus | "ALL")} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary">
              <option value="ALL">All</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
            <select value={selectedAssignee} onChange={(event) => setSelectedAssignee(event.target.value)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary">
              <option value="ALL">Anyone</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 w-full md:w-44">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
            <select value={dueFilter} onChange={(event) => setDueFilter(event.target.value as FilterMode)} className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:border-primary">
              <option value="ALL">Anytime</option>
              <option value="TODAY">Today</option>
              <option value="NEXT_7_DAYS">Next 7 Days</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("ALL");
              setSelectedAssignee("ALL");
              setDueFilter("ALL");
            }}
            className="mt-5 text-sm font-bold text-primary hover:underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-secondary">
          <p className="text-label-md text-on-surface-variant uppercase">Total Tasks</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">{taskCounts.total}</h3>
          <p className="text-label-sm text-secondary font-bold mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_up</span> {taskCounts.completed} completed
          </p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-on-tertiary-container">
          <p className="text-label-md text-on-surface-variant uppercase">In Progress</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">{taskCounts.inProgress}</h3>
          <p className="text-label-sm text-on-surface-variant mt-2">{assignments.filter((assignment) => assignment.status === "REVIEW").length} assignments in Review</p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-error">
          <p className="text-label-md text-on-surface-variant uppercase">At Risk</p>
          <h3 className="font-headline-md text-headline-md text-error mt-1">{taskCounts.overdue}</h3>
          <p className="text-label-sm text-on-surface-variant mt-2">Due in the past</p>
        </div>
        <div className="glass-card p-6 rounded-xl shadow-sm border-l-4 border-l-primary">
          <p className="text-label-md text-on-surface-variant uppercase">Utilization</p>
          <h3 className="font-headline-md text-headline-md text-primary mt-1">{utilization}%</h3>
          <div className="w-full bg-surface-container mt-3 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full" style={{ width: `${utilization}%` }}></div>
          </div>
        </div>
      </div>

      {view === "list" && (
        <div className="mb-8">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
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
                  {filteredAssignments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No assignments match the current filters.</td>
                    </tr>
                  ) : filteredAssignments.map((task) => {
                    const progress = getProgress(task.status);
                    return (
                      <tr key={task.id} className="hover:bg-surface-container-low transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className={`font-title-lg text-title-lg text-primary ${task.status === "COMPLETED" ? "text-opacity-50 line-through" : ""}`}>{task.title}</span>
                            <span className="font-body-sm text-body-sm text-on-surface-variant">{task.client?.name || "No Client"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center -space-x-2">
                            {task.user ? <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold bg-secondary-container text-on-secondary-container" title={task.user.name}>{task.user.name.substring(0, 2).toUpperCase()}</div> : <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-500">-</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-md font-semibold ${getStatusColor(task.status)}`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{task.deadline ? new Date(task.deadline).toLocaleDateString() : "-"}</td>
                        <td className="px-6 py-4">
                          {task.status === "COMPLETED" ? (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-on-tertiary-container text-base">check_circle</span>
                              <span className="font-body-md text-body-md font-bold text-on-tertiary-container">Completed</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-body-md text-body-md font-bold text-on-surface">{progress}%</span>
                              <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-1">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                          {menuOpenId === task.id && (
                            <div className="absolute right-6 top-10 bg-white border border-slate-200 shadow-lg rounded-lg py-1 z-10 w-32">
                              <button
                                onClick={() => handleDeleteAssignment(task.id)}
                                disabled={isDeleting === task.id}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isDeleting === task.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
              <p className="text-label-sm text-on-surface-variant">Showing 1 to {filteredAssignments.length} of {assignments.length} results</p>
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
        </div>
      )}

      {view === "kanban" && (
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 xl:gap-6 w-full">
            {columns.map((column) => {
              const tasksInColumn = filteredAssignments.filter((assignment) => assignment.status === column.status);
              return (
                <div
                  key={column.status}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleDrop(event, column.status)}
                  className={`rounded-xl border border-outline-variant/60 shadow-sm flex flex-col min-h-[450px] max-h-[800px] p-4 ${column.bg} transition-colors ${draggedTaskId ? "hover:border-primary hover:bg-primary/5" : ""}`}
                >
                  <div className={`border-t-4 ${column.border} pt-2 pb-3 mb-4 flex justify-between items-center sticky top-0 bg-inherit z-10`}>
                    <h4 className="font-title-lg text-title-lg text-primary">{column.title}</h4>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-xs font-bold text-on-surface-variant">{tasksInColumn.length}</span>
                  </div>
  
                  <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
                    {tasksInColumn.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center border-2 border-dashed border-outline-variant/50 rounded-lg p-6 text-center pointer-events-none">
                        <p className="text-label-sm text-on-surface-variant/60">Drop tasks here</p>
                      </div>
                    ) : (
                      tasksInColumn.map((task) => {
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => setDraggedTaskId(task.id)}
                            className={`bg-white border border-outline-variant/60 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/40 transition-all group flex flex-col justify-between cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? "opacity-50 border-dashed scale-95" : ""} ${updatingTaskId === task.id ? "animate-pulse ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            <div>
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(task.status)}`}>
                                  {task.status.replace("_", " ")}
                                </span>
                                <div className="relative">
                                  <button onClick={() => setMenuOpenId(menuOpenId === task.id ? null : task.id)} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer p-0.5 -mr-1">
                                    <span className="material-symbols-outlined text-[16px]">more_vert</span>
                                  </button>
                                  {menuOpenId === task.id && (
                                    <div className="absolute right-0 top-6 bg-white border border-slate-200 shadow-lg rounded-lg py-1 z-20 w-32">
                                      <button
                                        onClick={() => handleDeleteAssignment(task.id)}
                                        disabled={isDeleting === task.id}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isDeleting === task.id ? "Deleting..." : "Delete"}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <h5 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">{task.title}</h5>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">{task.client?.name || "No Client"}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-slate-400">schedule</span>
                                <span className="text-[10px] font-bold text-slate-500">{getTimeLeftLabel(task.deadline)}</span>
                              </div>
                              {task.user ? (
                                <div className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-[9px] font-bold bg-slate-100 text-slate-600" title={task.user.name}>
                                  {task.user.name.substring(0, 2).toUpperCase()}
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center bg-slate-50" title="Unassigned">
                                  <span className="material-symbols-outlined text-[12px] text-slate-300">person_add</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === "activity" && (
        <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[500px] mb-8">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-primary">history</span> Activity Feed
            </h3>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Live</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No recent activity.</p>
            ) : logs.map((log) => (
              <div key={log.id} className="flex gap-3 items-start">
                <div className="w-8 h-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-xs">
                  {log.user?.name ? log.user.name.substring(0,2).toUpperCase() : "AU"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-600 leading-tight">
                    <span className="font-bold text-slate-800">{log.user?.name || "System"}</span> {log.details}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-title-lg text-title-lg text-primary">Recent Activity</h4>
            <Link href="/dashboard" className="text-secondary font-label-md text-label-md hover:underline cursor-pointer">View Dashboard</Link>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant">Activity tracking will be backed by an audit log table in the next slice. The board now reflects live assignment changes and creation events.</p>
          </div>
        </div>
        <div className="bg-primary text-on-primary rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="font-title-lg text-title-lg mb-2">Immediate Focus</h4>
            <p className="text-body-sm text-on-primary-container mb-6">{taskCounts.overdue} assignments are overdue and need attention today.</p>
            <button onClick={() => setIsCreateOpen(true)} className="w-full mt-6 py-2 border border-secondary text-secondary font-label-md text-label-md rounded hover:bg-secondary hover:text-on-secondary transition-all cursor-pointer">
              Open Create Dialog
            </button>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="12" /></svg>
          </div>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <form action={handleCreateAssignment} className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Create Assignment</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
                <input name="title" type="text" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53]" placeholder="Quarterly GST filing" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea name="description" rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] resize-none" placeholder="Scope, expected outcome, and notes" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Client</label>
                  <select name="clientId" required className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white">
                    <option value="">Select client</option>
                    {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
                  <select name="userId" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white">
                    <option value="">Unassigned</option>
                    {users.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select name="status" defaultValue="TODO" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REVIEW">In Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                  <select name="priority" defaultValue="MEDIUM" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Deadline</label>
                <input name="deadline" type="date" className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#005c53] bg-white" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">Cancel</button>
              <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary hover:opacity-90 text-white font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center min-w-[120px] disabled:opacity-80 disabled:cursor-not-allowed">
                {isSaving ? <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span> : "Save Assignment"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}