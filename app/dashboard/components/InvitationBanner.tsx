"use client";
import { useState } from "react";
import { respondToInvitation } from "@/lib/actions/staff-actions";

export default function InvitationBanner({
  invitationId,
  firmName,
  jobTitle
}: {
  invitationId: string,
  firmName: string,
  jobTitle: string
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = async (action: "ACCEPT" | "DECLINE") => {
    setIsSubmitting(true);
    try {
      const res = await respondToInvitation(invitationId, action);
      if (res?.error) {
        alert(res.error);
      } else {
        if (action === "ACCEPT") {
          alert(`You have successfully joined ${firmName}!`);
        }
      }
    } catch (error: any) {
      alert(error.message || `Failed to ${action.toLowerCase()} invitation.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-primary text-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md z-10 relative">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-3xl">mail</span>
        <div>
          <h4 className="font-title-md font-bold">You've been invited!</h4>
          <p className="font-label-md opacity-90">
            You have been invited to join <strong>{firmName}</strong> as a <strong>{jobTitle}</strong>.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("DECLINE")}
          disabled={isSubmitting}
          className="px-4 py-2 border border-white text-white rounded-lg font-label-md hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Decline
        </button>
        <button
          onClick={() => handleAction("ACCEPT")}
          disabled={isSubmitting}
          className="px-6 py-2 bg-white text-primary rounded-lg font-label-md font-bold hover:bg-surface transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Processing..." : "Accept & Join Firm"}
        </button>
      </div>
    </div>
  );
}
