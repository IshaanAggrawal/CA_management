import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | ProAudit CA",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <DashboardSidebar />
      <DashboardHeader />
      {/* Main Content Canvas */}
      <main className="ml-[260px] p-6 max-w-[calc(1440px-260px)] min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
