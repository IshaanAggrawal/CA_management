import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { UserRole } from "@prisma/client";
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

  let dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        role: (user.publicMetadata?.role === "ADMIN" ? "ADMIN" : "STAFF") as UserRole,
      }
    });
  } else {
    dbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      }
    });
  }

  // Self-heal: If database role differs from Clerk, update Clerk to match DB
  if (dbUser.role !== user.publicMetadata?.role) {
    const client = await clerkClient();
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: { role: dbUser.role }
    });
  }

  const role = dbUser.role;
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <DashboardSidebar role={role as "ADMIN" | "STAFF"} />
      <DashboardHeader />
      {/* Main Content Canvas */}
      <main className="ml-[260px] p-6 max-w-[calc(1440px-260px)] min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
