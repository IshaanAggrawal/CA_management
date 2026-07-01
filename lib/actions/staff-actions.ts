"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";

// Utility function to check admin rights
async function requireAdmin() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  
  if (user.publicMetadata?.role !== "ADMIN") {
    // Check DB as fallback
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (dbUser?.role !== "ADMIN") {
      throw new Error("Unauthorized: Only Admins can perform this action.");
    }
  }
  return user;
}

export async function inviteStaff(email: string, role: "ADMIN" | "STAFF", jobTitle: string) {
  await requireAdmin();

  const client = await clerkClient();
  await client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: {
      role: role,
      jobTitle: jobTitle
    }
  });

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function deleteStaff(userIdToDelete: string) {
  const user = await requireAdmin();

  if (user.id === userIdToDelete) {
    throw new Error("Cannot delete your own account.");
  }

  // Delete from Prisma first to handle foreign keys if necessary, or just rely on cascade
  // Since we haven't set up Cascade delete for assignments/documents, we must update them.
  // Actually, standard practice: we should just unassign them.
  await prisma.assignment.updateMany({
    where: { userId: userIdToDelete },
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
  const user = await requireAdmin();

  // Ensure they aren't demoting themselves if they are the only admin
  if (user.id === userIdToChange && role === "STAFF") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
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
    publicMetadata: { role, jobTitle }
  });
  
  // Try to update name in Clerk as well if possible (optional)
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
  // Alias to the new function for backward compatibility
  const user = await prisma.user.findUnique({ where: { id: userIdToChange } });
  if (!user) throw new Error("User not found");
  
  return updateStaffProfile(userIdToChange, user.name, user.jobTitle || "", newRole);
}
