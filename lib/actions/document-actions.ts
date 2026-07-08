"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { getFirmId } from "@/lib/auth-utils";

export async function uploadDocument(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;
  const direction = (formData.get("direction") as any) || "INTERNAL";
  const file = formData.get("file") as File;

  if (!name || !clientId || !file) {
    throw new Error("Missing required fields");
  }

  // Simulated upload: In a real app, you would upload to Cloudinary/AWS S3 here
  // and get back the URL. We will just use a fake URL and the file size for now.
  const url = `https://fake-storage.com/${Date.now()}-${file.name}`;
  const size = file.size;

  const firmId = await getFirmId();
  if (!firmId) throw new Error("User does not belong to a firm");

  const doc = await prisma.document.create({
    data: {
      name,
      url,
      size,
      direction,
      clientId,
      userId: user.id,
      firmId
    },
    include: {
      client: true
    }
  });

  if (direction === "CLIENT_SHARED" && doc.client.email) {
    const { sendEmailNotification } = await import("@/lib/notifications");
    await sendEmailNotification(
      doc.client.email,
      "New Document Shared With You",
      `<p>Hello ${doc.client.name},</p><p>A new document (<b>${name}</b>) has been shared with you.</p>`
    );
  }

  await prisma.activityLog.create({
    data: {
      action: "UPLOADED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      details: `Uploaded document "${name}"`,
      userId: user.id,
      firmId
    }
  });

  revalidatePath("/dashboard/documents");
}

export async function deleteDocument(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized");

  const doc = await prisma.document.findUnique({ where: { id, firmId } });
  if (!doc) throw new Error("Not found");

  // Allow admins or the uploader to delete
  if (user.publicMetadata?.role !== "ADMIN" && doc.userId !== user.id) {
    throw new Error("Unauthorized to delete this document");
  }

  await prisma.activityLog.create({
    data: {
      action: "DELETED",
      entityType: "DOCUMENT",
      entityId: id,
      details: `Deleted document "${doc.name}"`,
      userId: user.id,
      firmId
    }
  });

  await prisma.document.delete({ where: { id } });
  revalidatePath("/dashboard/documents");
}

export async function createDsc(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const providerName = formData.get("providerName") as string;
  const password = formData.get("password") as string;
  const clientId = formData.get("clientId") as string;
  const issueDate = formData.get("issueDate") as string;
  const expiryDate = formData.get("expiryDate") as string;

  if (!providerName || !clientId || !expiryDate) {
    throw new Error("Missing required fields");
  }

  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized");

  await prisma.digitalSignature.create({
    data: {
      providerName,
      password: password || null,
      clientId,
      issueDate: issueDate ? new Date(issueDate) : null,
      expiryDate: new Date(expiryDate),
      firmId,
    }
  });

  revalidatePath("/dashboard/documents");
}

export async function deleteDsc(id: string) {
  const firmId = await getFirmId();
  await prisma.digitalSignature.delete({ where: { id, firmId: firmId || "" } });
  revalidatePath("/dashboard/documents");
}

export async function createUdin(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const udinNumber = formData.get("udinNumber") as string;
  const documentType = formData.get("documentType") as string;
  const clientId = formData.get("clientId") as string;
  const assignmentId = formData.get("assignmentId") as string;

  if (!udinNumber || !documentType || !clientId) {
    throw new Error("Missing required fields");
  }

  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized");

  await prisma.udin.create({
    data: {
      udinNumber,
      documentType,
      generatedAt: new Date(),
      clientId,
      assignmentId: assignmentId || null,
      firmId
    }
  });

  revalidatePath("/dashboard/documents");
}

export async function deleteUdin(id: string) {
  const firmId = await getFirmId();
  await prisma.udin.delete({ where: { id, firmId: firmId || "" } });
  revalidatePath("/dashboard/documents");
}
