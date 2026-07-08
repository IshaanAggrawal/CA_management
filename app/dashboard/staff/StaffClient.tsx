"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { changeUserRole, inviteStaff, deleteStaff, updateStaffProfile, revokeInvitation, resendInvitation } from "@/lib/actions/staff-actions";

type StaffUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  jobTitle: string | null;
  assignments?: { id: string }[];
};

export default function StaffClient({
  users = [],
  currentUserId,
  currentUserRole,
  pendingAllocations = [],
  invitations = []
}: {
  users: StaffUser[],
  currentUserId: string,
  currentUserRole: string,
  pendingAllocations?: any[],
  invitations?: any[]
}) {
  const router = useRouter();
  
  // State for Filters
  const [filter, setFilter] = useState<"ALL" | "PARTNER" | "MANAGER" | "ASSOCIATE">("ALL");

  // State for Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<StaffUser | null>(null);
  
  // State for Dropdowns
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredUsers = useMemo(() => {
    if (filter === "ALL") return users;
    return users.filter(u => {
      const title = (u.jobTitle || "").toLowerCase();
      if (filter === "PARTNER") return title.includes("partner");
      if (filter === "MANAGER") return title.includes("manager");
      if (filter === "ASSOCIATE") return title.includes("associate");
      return false;
    });
  }, [users, filter]);

  const getTotalCapacity = () => users.length * 20;
  const getActiveAssignments = () => users.reduce((acc, user) => acc + (user.assignments?.length || 0), 0);

  const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await inviteStaff(
        fd.get("email") as string,
        fd.get("role") as "ADMIN" | "STAFF",
        fd.get("jobTitle") as string
      );
      if (res?.error) {
        alert(res.error);
        return;
      }
      setIsInviteModalOpen(false);
      alert("Invitation sent successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to invite staff.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editUser) return;
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await updateStaffProfile(
        editUser.id,
        fd.get("name") as string,
        fd.get("jobTitle") as string,
        fd.get("role") as "ADMIN" | "STAFF"
      );
      if (res?.error) {
        alert(res.error);
        return;
      }
      setEditUser(null);
    } catch (error: any) {
      alert(error.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely remove this staff member? This cannot be undone.")) return;
    try {
      const res = await deleteStaff(id);
      if (res?.error) {
        alert(res.error);
      }
    } catch (error: any) {
      alert(error.message || "Failed to delete staff.");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;
    try {
      const res = await revokeInvitation(id);
      if (res?.error) {
        alert(res.error);
      }
    } catch (error: any) {
      alert(error.message || "Failed to revoke invitation.");
    }
  };

  const handleResend = async (id: string) => {
    try {
      const res = await resendInvitation(id);
      if (res?.error) {
        alert(res.error);
      } else {
        alert("Invitation resent successfully!");
      }
    } catch (error: any) {
      alert(error.message || "Failed to resend invitation.");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Page Header & Stats */}
      <div className="flex justify-between items-end">
        <div>
          <h3 className="font-headline-md text-headline-md text-primary">Staff Management</h3>
          <p className="font-body-md text-on-surface-variant">Manage team bandwidth, monitor efficiency, and allocate assignments.</p>
        </div>
        <div className="flex gap-4">
          {currentUserRole === "ADMIN" && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-secondary hover:brightness-110 text-white px-4 py-2 rounded-lg font-label-md flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              Invite Team Member
            </button>
          )}
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
              <p className="font-title-lg text-title-lg text-primary">{getActiveAssignments()}/{getTotalCapacity()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Staff Directory */}
        <div className="col-span-12 lg:col-span-8 bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <div className="flex gap-4">
              <button onClick={() => setFilter("ALL")} className={`font-label-md text-label-md py-1 cursor-pointer transition-colors ${filter === "ALL" ? "border-b-2 border-secondary text-primary" : "text-on-surface-variant hover:text-primary"}`}>All Team</button>
              <button onClick={() => setFilter("PARTNER")} className={`font-label-md text-label-md py-1 cursor-pointer transition-colors ${filter === "PARTNER" ? "border-b-2 border-secondary text-primary" : "text-on-surface-variant hover:text-primary"}`}>Partners</button>
              <button onClick={() => setFilter("MANAGER")} className={`font-label-md text-label-md py-1 cursor-pointer transition-colors ${filter === "MANAGER" ? "border-b-2 border-secondary text-primary" : "text-on-surface-variant hover:text-primary"}`}>Managers</button>
              <button onClick={() => setFilter("ASSOCIATE")} className={`font-label-md text-label-md py-1 cursor-pointer transition-colors ${filter === "ASSOCIATE" ? "border-b-2 border-secondary text-primary" : "text-on-surface-variant hover:text-primary"}`}>Associates</button>
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[400px]">
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
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-on-surface-variant italic">No staff members found in this category.</td>
                  </tr>
                )}
                {filteredUsers.map((user) => {
                  const activeCount = user.assignments?.length || 0;
                  const loadPercentage = Math.min(Math.round((activeCount / 20) * 100), 100);
                  const loadStatus = loadPercentage >= 80 ? { text: "CRITICAL", color: "text-error", bg: "bg-error" } :
                    loadPercentage >= 60 ? { text: "STABLE", color: "text-on-secondary-container", bg: "bg-on-secondary-container" } :
                      { text: "AVAILABLE", color: "text-secondary", bg: "bg-secondary" };
                  const efficiency = Math.max(70, 100 - Math.round(loadPercentage / 2));

                  return (
                    <tr key={user.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary font-bold">
                            {user.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-label-md text-primary">{user.name}</p>
                            <p className="font-label-sm text-on-surface-variant">{user.jobTitle || "Staff"} • {user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">{activeCount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-label-md text-on-tertiary-container">{efficiency}%</span>
                          <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                            <div className="h-full bg-on-tertiary-container" style={{ width: `${efficiency}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-on-surface-variant">
                            <span>{loadPercentage}% LOAD</span>
                            <span className={loadStatus.color}>{loadStatus.text}</span>
                          </div>
                          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                            <div className={`h-full ${loadStatus.bg}`} style={{ width: `${loadPercentage}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right relative">
                        {currentUserRole === "ADMIN" && (
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                              className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                            
                            {openDropdownId === user.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant z-20 py-1 overflow-hidden">
                                  <button
                                    onClick={() => { setEditUser(user); setOpenDropdownId(null); }}
                                    className="w-full text-left px-4 py-2 font-label-md text-on-surface hover:bg-surface-container cursor-pointer flex items-center gap-2"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span> Edit Profile
                                  </button>
                                  {user.id !== currentUserId && (
                                    <button
                                      onClick={() => { handleDelete(user.id); setOpenDropdownId(null); }}
                                      className="w-full text-left px-4 py-2 font-label-md text-error hover:bg-error-container cursor-pointer flex items-center gap-2"
                                    >
                                      <span className="material-symbols-outlined text-sm">delete</span> Remove Member
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        {currentUserRole !== "ADMIN" && user.id === currentUserId && (
                          <span className="text-on-surface-variant font-label-sm italic">You</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pending Invitations Section */}
          {invitations && invitations.length > 0 && currentUserRole === "ADMIN" && (
            <div className="mt-8 border-t border-outline-variant pt-6 px-6 pb-6">
              <h4 className="font-title-md text-primary mb-4">Pending Invitations</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-lowest">
                    <tr className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                      <th className="px-6 py-3 font-semibold">Email</th>
                      <th className="px-6 py-3 font-semibold">Role</th>
                      <th className="px-6 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-surface-container-lowest transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-label-md text-primary">{inv.email}</p>
                          <p className="font-label-sm text-on-surface-variant text-[10px]">Invited: {new Date(inv.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-label-sm text-on-surface-variant">{inv.jobTitle || "Staff"} • {inv.role}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleResend(inv.id)} className="text-secondary hover:text-primary font-label-md mr-4 cursor-pointer">Resend</button>
                          <button onClick={() => handleRevoke(inv.id)} className="text-error hover:text-error-container font-label-md cursor-pointer">Revoke</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Pending Allocations (Side Panel) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-6xl">assignment_late</span>
            </div>
            <h4 className="font-title-lg text-title-lg text-primary mb-4">Pending Allocations</h4>
            <div className="space-y-4">
              {pendingAllocations.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">No pending allocations.</p>
              ) : (
                pendingAllocations.map(assignment => (
                  <div key={assignment.id} className="p-4 bg-surface-container rounded-lg border border-outline-variant hover:border-secondary transition-all cursor-move">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${assignment.priority === 'HIGH' ? 'bg-primary text-white' : 'bg-surface-container-highest text-primary'
                          }`}>
                          {assignment.priority}
                        </span>
                        <h5 className="font-label-md text-primary mt-1">{assignment.title}</h5>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant">drag_indicator</span>
                    </div>
                    <div className="flex justify-between items-center text-label-sm text-on-surface-variant mt-2">
                      <span>Client: {assignment.client?.name || "None"}</span>
                      {assignment.deadline && <span>Due: {new Date(assignment.deadline).toLocaleDateString()}</span>}
                    </div>
                    <button onClick={() => router.push("/dashboard/assignments")} className="w-full mt-3 py-1.5 border border-secondary text-secondary rounded font-label-md hover:bg-secondary hover:text-white transition-all cursor-pointer">Quick Assign</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary">Invite Team Member</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">Email Address</label>
                <input required type="email" name="email" placeholder="colleague@proauditca.com" className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">Job Title</label>
                <input required type="text" name="jobTitle" placeholder="e.g. Senior Partner, Tax Manager" className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">System Access Role</label>
                <select name="role" defaultValue="STAFF" className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none cursor-pointer">
                  <option value="STAFF">Staff (Limited Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-label-md cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-secondary hover:brightness-110 text-white rounded-lg font-label-md cursor-pointer transition-all disabled:opacity-50">
                  {isSubmitting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-primary">Edit Profile</h3>
              <button onClick={() => setEditUser(null)} className="text-on-surface-variant hover:text-error transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">Full Name</label>
                <input required type="text" name="name" defaultValue={editUser.name} className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">Email</label>
                <input type="text" disabled defaultValue={editUser.email} className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-low opacity-70 cursor-not-allowed" />
                <p className="text-[10px] text-on-surface-variant mt-1">Email cannot be changed directly.</p>
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">Job Title</label>
                <input required type="text" name="jobTitle" defaultValue={editUser.jobTitle || ""} className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none" />
              </div>
              
              <div className="space-y-1">
                <label className="font-label-sm text-on-surface uppercase tracking-wider">System Access Role</label>
                <select name="role" defaultValue={editUser.role} disabled={editUser.id === currentUserId} className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:border-primary focus:outline-none cursor-pointer disabled:opacity-70">
                  <option value="STAFF">Staff (Limited Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
                {editUser.id === currentUserId && (
                  <p className="text-[10px] text-error mt-1">You cannot change your own role here.</p>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg font-label-md cursor-pointer transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-secondary hover:brightness-110 text-white rounded-lg font-label-md cursor-pointer transition-all disabled:opacity-50">
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
