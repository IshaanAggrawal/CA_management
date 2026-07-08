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
    let initialFirmId = user.publicMetadata?.firmId as string | undefined;
    let initialRole = (user.publicMetadata?.role === "ADMIN" ? "ADMIN" : "STAFF") as UserRole;

    dbUser = await prisma.$transaction(async (tx) => {
      let finalFirmId = initialFirmId;
      let finalRole = initialRole;

      // Check if invited firm actually exists (it might have been deleted)
      if (finalFirmId) {
        const existingFirm = await tx.firm.findUnique({ where: { id: finalFirmId } });
        if (!existingFirm) {
          finalFirmId = undefined; // Fallback to creating a new firm
        }
      }

      // If no firm exists, create one and make them ADMIN
      if (!finalFirmId) {
        const firm = await tx.firm.create({
          data: {
            name: `${user.firstName || "My"} Firm`,
            planTier: "FREE",
            subscriptionStatus: "ACTIVE",
          }
        });
        finalFirmId = firm.id;
        finalRole = "ADMIN";
      }

      // Create the user linked to the verified firm
      return await tx.user.create({
        data: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
          role: finalRole,
          firmId: finalFirmId
        }
      });
    });
  } else {
    // Update basic profile info on subsequent logins
    dbUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.emailAddresses[0]?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      }
    });
  }

  // Self-heal: If database role or firm differs from Clerk, update Clerk to match DB
  try {
    if (dbUser.role !== user.publicMetadata?.role || dbUser.firmId !== user.publicMetadata?.firmId) {
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: { 
          ...user.publicMetadata,
          role: dbUser.role,
          firmId: dbUser.firmId 
        }
      });
    }
  } catch (error) {
    console.error("Failed to sync Clerk metadata (non-fatal):", error);
  }

  const role = dbUser.role;
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <DashboardSidebar role={role as "ADMIN" | "STAFF"} />
      <DashboardHeader />
      {/* Main Content Canvas */}
      <main className="ml-[260px] p-6 min-h-[calc(100vh-64px)]">
        {children}
      </main>
    </div>
  );
}
