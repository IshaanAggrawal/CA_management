"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DashboardHeaderClientProps = {
  userName: string;
  userRole: string;
  UserButton: React.ComponentType;
};

export default function DashboardHeaderClient({ userName, userRole, UserButton }: DashboardHeaderClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <header className="h-16 sticky top-0 z-40 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline flex items-center justify-between px-6 w-full ml-[260px] max-w-[calc(1440px-260px)]">
      <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">search</span>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-label-md focus:ring-2 focus:ring-secondary transition-all"
            placeholder="Search clients, assignments, invoices, staff..."
            type="search"
          />
        </div>
      </form>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 pr-4 border-r border-outline-variant">
          <button onClick={() => router.push("/dashboard/search?q=notifications")} className="p-2 rounded-full hover:bg-surface-container-high transition-colors relative">
            <span className="material-symbols-outlined text-primary">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button onClick={() => router.push("/dashboard/search?q=recent")} className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">history</span>
          </button>
        </div>
        <button onClick={() => router.push("/dashboard/clients")} className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md hover:bg-on-primary-fixed-variant transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">add</span>
          Create New
        </button>
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-primary">{userName}</p>
            <p className="text-[10px] text-on-surface-variant">{userRole}</p>
          </div>
          <UserButton />
        </div>
      </div>
    </header>
  );
}