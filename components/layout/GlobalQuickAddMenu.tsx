"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface GlobalQuickAddMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalQuickAddMenu({ isOpen, onClose }: GlobalQuickAddMenuProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleAction = (route: string) => {
    onClose();
    router.push(route);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_circle</span>
            Quick Create
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-2">
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => handleAction("/dashboard/clients")}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-on-primary transition-colors">
                <span className="material-symbols-outlined">person_add</span>
              </div>
              <div>
                <p className="font-body-lg font-bold text-on-surface">New Client</p>
                <p className="font-body-sm text-on-surface-variant">Onboard a new client or entity</p>
              </div>
            </button>
            
            <button
              onClick={() => handleAction("/dashboard/assignments")}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                <span className="material-symbols-outlined">assignment_add</span>
              </div>
              <div>
                <p className="font-body-lg font-bold text-on-surface">New Assignment</p>
                <p className="font-body-sm text-on-surface-variant">Create a new task or audit job</p>
              </div>
            </button>

            <button
              onClick={() => handleAction("/dashboard/billing")}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors">
                <span className="material-symbols-outlined">receipt_long</span>
              </div>
              <div>
                <p className="font-body-lg font-bold text-on-surface">Create Invoice</p>
                <p className="font-body-sm text-on-surface-variant">Bill a client for completed work</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
