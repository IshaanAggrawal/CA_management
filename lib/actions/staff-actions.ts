"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { getFirmId } from "@/lib/auth-utils";

// Utility function to check admin rights
async function requireAdmin() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser || dbUser.role !== "ADMIN") {
    throw new Error("Unauthorized: Only Admins can perform this action.");
  }
  
  if (!dbUser.firmId) {
    throw new Error("No firm associated with this user.");
  }

  return { user, dbUser, firmId: dbUser.firmId };
}

export async function inviteStaff(email: string, role: "ADMIN" | "STAFF", jobTitle: string) {
  const { firmId } = await requireAdmin();

  const firm = await prisma.firm.findUnique({ where: { id: firmId }, select: { planTier: true } });
  if (!firm) throw new Error("Firm not found");

  const count = await prisma.user.count({ where: { firmId } });
  
  const limits = {
    FREE: 1,
    PRO: 3,
    ENTERPRISE: Infinity
  };
  
  const maxStaff = limits[firm.planTier as keyof typeof limits] || limits.FREE;
  if (count >= maxStaff) {
    throw new Error(`Staff limit reached for ${firm.planTier} plan. Please upgrade to add more.`);
  }

  const client = await clerkClient();
  await client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: {
      role: role,
      jobTitle: jobTitle,
      firmId: firmId // Important so they join the same firm upon signup
    }
  });

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function deleteStaff(userIdToDelete: string) {
  const { user, firmId } = await requireAdmin();

  if (user.id === userIdToDelete) {
    throw new Error("Cannot delete your own account.");
  }

  const userToDelete = await prisma.user.findUnique({ where: { id: userIdToDelete }});
  if (userToDelete?.firmId !== firmId) {
    throw new Error("User does not belong to your firm.");
  }

  // Unassign assignments
  await prisma.assignment.updateMany({
    where: { userId: userIdToDelete, firmId },
    data: { userId: null }
  });

  await prisma.user.delete({
    where: { id: userIdToDelete }
  });

  // Delete from Clerk
  const client = await clerkClient();
  await client.users.deleteUser(userIdToDelete);

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function updateStaffProfile(userIdToChange: string, name: string, jobTitle: string, role: "ADMIN" | "STAFF") {
  const { user, firmId } = await requireAdmin();

  const userToChange = await prisma.user.findUnique({ where: { id: userIdToChange }});
  if (userToChange?.firmId !== firmId) {
    throw new Error("User does not belong to your firm.");
  }

  // Ensure they aren't demoting themselves if they are the only admin
  if (user.id === userIdToChange && role === "STAFF") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN", firmId } });
    if (adminCount <= 1) {
      throw new Error("Cannot demote the only admin.");
    }
  }

  // Update Prisma DB
  await prisma.user.update({
    where: { id: userIdToChange },
    data: { name, jobTitle, role }
  });

  // Update Clerk Metadata
  const client = await clerkClient();
  await client.users.updateUserMetadata(userIdToChange, {
    publicMetadata: { role, jobTitle, firmId }
  });
  
  const names = name.split(" ");
  await client.users.updateUser(userIdToChange, {
    firstName: names[0],
    lastName: names.slice(1).join(" ")
  });

  revalidatePath("/dashboard/staff");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function changeUserRole(userIdToChange: string, newRole: "ADMIN" | "STAFF") {
  const user = await prisma.user.findUnique({ where: { id: userIdToChange } });
  if (!user) throw new Error("User not found");
  
  return updateStaffProfile(userIdToChange, user.name, user.jobTitle || "", newRole);
}
