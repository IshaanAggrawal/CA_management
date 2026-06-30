import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | ProAudit CA",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  // Sync Clerk user to our Prisma Database
  await prisma.user.upsert({
    where: { id: user.id },
    update: { 
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
    },
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      role: (user.publicMetadata?.role as string) || "STAFF",
    }
  });
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
