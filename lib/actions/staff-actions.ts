"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { getFirmId } from "@/lib/auth-utils";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
  try {
    const { firmId } = await requireAdmin();

    const firm = await prisma.firm.findUnique({ where: { id: firmId }, select: { planTier: true, name: true } });
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
    
    // Check if the user already exists in Clerk
    const existingUsers = await client.users.getUserList({ emailAddress: [email] });
    const userExists = existingUsers.data && existingUsers.data.length > 0;
    
    // Create the DB invitation
    const invitation = await prisma.invitation.create({
      data: {
        email,
        role,
        jobTitle,
        firmId
      }
    });

    if (userExists) {
      // User already exists. Send them a custom email using Resend to notify them.
      // They will accept it via the UI banner when they log in.
      const { data, error } = await resend.emails.send({
        from: 'BVG Site <onboarding@resend.dev>',
        to: email,
        subject: `You have been invited to join ${firm.name}`,
        html: `<p>Hello!</p>
               <p>You have been invited to join <strong>${firm.name}</strong> as a <strong>${jobTitle} (${role})</strong>.</p>
               <p>Please log in to your dashboard to accept or decline this invitation.</p>
               <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard">Go to Dashboard</a></p>`
      });

      if (error) {
        console.error("Resend error:", error);
      }
    } else {
      // Normal Clerk invitation for new users
      await client.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: {
          role: role,
          jobTitle: jobTitle,
          firmId: firmId // Important so they join the same firm upon signup
        },
        ignoreExisting: true
      });
    }

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to invite staff." };
  }
}

export async function deleteStaff(userIdToDelete: string) {
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete staff." };
  }
}

export async function updateStaffProfile(userIdToChange: string, name: string, jobTitle: string, role: "ADMIN" | "STAFF") {
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update profile." };
  }
}

export async function changeUserRole(userIdToChange: string, newRole: "ADMIN" | "STAFF") {
  try {
    const user = await prisma.user.findUnique({ where: { id: userIdToChange } });
    if (!user) throw new Error("User not found");
    
    return await updateStaffProfile(userIdToChange, user.name, user.jobTitle || "", newRole);
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to change user role." };
  }
}

export async function revokeInvitation(invitationId: string) {
  try {
    const { firmId } = await requireAdmin();
    
    await prisma.invitation.update({
      where: { id: invitationId, firmId },
      data: { status: "REVOKED" }
    });

    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to revoke invitation." };
  }
}

export async function resendInvitation(invitationId: string) {
  try {
    const { firmId } = await requireAdmin();
    
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId, firmId },
      include: { firm: true }
    });
    if (!invitation || invitation.status !== "PENDING") throw new Error("Invalid or inactive invitation.");

    const client = await clerkClient();
    const existingUsers = await client.users.getUserList({ emailAddress: [invitation.email] });
    const userExists = existingUsers.data && existingUsers.data.length > 0;

    if (userExists) {
      await resend.emails.send({
        from: 'BVG Site <onboarding@resend.dev>',
        to: invitation.email,
        subject: `Reminder: You have been invited to join ${invitation.firm.name}`,
        html: `<p>Hello!</p>
               <p>This is a reminder that you have been invited to join <strong>${invitation.firm.name}</strong> as a <strong>${invitation.jobTitle} (${invitation.role})</strong>.</p>
               <p>Please log in to your dashboard to accept or decline this invitation.</p>
               <p><a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard">Go to Dashboard</a></p>`
      });
    } else {
      // Clerk handles the email for generic invitations, but we can't easily "resend" a Clerk invite via their API 
      // without recreating it. We'll just create a new one.
      try {
        await client.invitations.createInvitation({
          emailAddress: invitation.email,
          publicMetadata: {
            role: invitation.role,
            jobTitle: invitation.jobTitle,
            firmId: invitation.firmId
          },
          ignoreExisting: true
        });
      } catch (e: any) {
        // Ignore if they already have an active Clerk invite
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to resend invitation." };
  }
}

export async function respondToInvitation(invitationId: string, action: "ACCEPT" | "DECLINE") {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) throw new Error("No email found.");

    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId }
    });

    if (!invitation || invitation.email !== userEmail || invitation.status !== "PENDING") {
      throw new Error("Invalid or inactive invitation.");
    }

    if (action === "DECLINE") {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "DECLINED" }
      });
    } else {
      // ACCEPT
      await prisma.$transaction(async (tx) => {
        // 1. Mark invitation as accepted
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: "ACCEPTED" }
        });

        // 2. Unassign from old firm if any (optional, but good practice for migrations)
        const oldDbUser = await tx.user.findUnique({ where: { id: user.id } });
        if (oldDbUser?.firmId) {
          await tx.assignment.updateMany({
            where: { userId: user.id, firmId: oldDbUser.firmId },
            data: { userId: null }
          });
        }

        // 3. Move the user to the new firm
        await tx.user.update({
          where: { id: user.id },
          data: {
            firmId: invitation.firmId,
            role: invitation.role,
            jobTitle: invitation.jobTitle
          }
        });
      });

      // Update Clerk metadata
      const client = await clerkClient();
      await client.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          role: invitation.role,
          jobTitle: invitation.jobTitle,
          firmId: invitation.firmId
        }
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/staff");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to respond to invitation." };
  }
}
