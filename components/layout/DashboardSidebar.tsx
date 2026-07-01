"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import GlobalQuickAddMenu from "./GlobalQuickAddMenu";

export default function DashboardSidebar({ role = "STAFF" }: { role?: "ADMIN" | "STAFF" }) {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { href: "/dashboard/clients", label: "Clients", icon: "group" },
    { href: "/dashboard/assignments", label: "Assignments", icon: "assignment" },
    { href: "/dashboard/calendar", label: "Calendar", icon: "calendar_today" },
    { href: "/dashboard/billing", label: "Billing", icon: "payments" },
    { href: "/dashboard/documents", label: "Documents", icon: "description" },
    ...(role === "ADMIN" ? [{ href: "/dashboard/staff", label: "Staff", icon: "badge" }] : []),
  ];

  const footerItems = [
    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    { href: "/dashboard/support", label: "Support", icon: "help" },
    { href: "/login", label: "Logout", icon: "logout" },
  ];

  const getLinkClass = (href: string) => {
    const isActive = href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(href);
    return `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      isActive
        ? "bg-on-primary-fixed-variant text-secondary-fixed font-bold shadow-sm"
        : "text-on-primary-container hover:bg-on-primary-fixed-variant/50 hover:text-on-primary"
    }`;
  };

  return (
    <aside className="w-[260px] h-full fixed left-0 top-0 bg-primary dark:bg-primary-container flex flex-col p-4 overflow-y-auto border-r border-outline-variant dark:border-outline z-50">
      <div className="mb-6 px-2">
        <h1 className="font-headline-sm text-headline-sm text-on-primary font-bold">ProAudit CA</h1>
        <p className="font-body-md text-body-md text-on-primary-container">Practice Management</p>
      </div>
      
      <button onClick={() => setIsQuickAddOpen(true)} className="mb-6 flex items-center justify-center gap-2 bg-on-tertiary-container text-on-tertiary py-3 px-4 rounded-xl font-bold transition-transform active:scale-95 cursor-pointer hover:bg-opacity-90">
        <span className="material-symbols-outlined">add</span>
        <span>New Entry</span>
      </button>

      <GlobalQuickAddMenu 
        isOpen={isQuickAddOpen} 
        onClose={() => setIsQuickAddOpen(false)} 
      />

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="pt-4 mt-auto border-t border-on-primary-container/20 space-y-1">
        {footerItems.map((item) => {
          if (item.label === "Logout") {
            return (
              <SignOutButton key={item.label}>
                <button className={`w-full ${getLinkClass(item.href)} cursor-pointer`}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-body-md">{item.label}</span>
                </button>
              </SignOutButton>
            );
          }
          return (
            <Link key={item.href} href={item.href} className={getLinkClass(item.href)}>
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
