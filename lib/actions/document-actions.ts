"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function uploadDocument(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const clientId = formData.get("clientId") as string;
  const file = formData.get("file") as File;

  if (!name || !clientId || !file) {
    throw new Error("Missing required fields");
  }

  // Simulated upload: In a real app, you would upload to Cloudinary/AWS S3 here
  // and get back the URL. We will just use a fake URL and the file size for now.
  const url = `https://fake-storage.com/${Date.now()}-${file.name}`;
  const size = file.size;

  const doc = await prisma.document.create({
    data: {
      name,
      url,
      size,
      clientId,
      userId: user.id
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "UPLOADED",
      entityType: "DOCUMENT",
      entityId: doc.id,
      details: `Uploaded document "${name}"`,
      userId: user.id
    }
  });

  revalidatePath("/dashboard/documents");
}

export async function deleteDocument(id: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const doc = await prisma.document.findUnique({ where: { id } });
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
      userId: user.id
    }
  });

  await prisma.document.delete({ where: { id } });
  revalidatePath("/dashboard/documents");
}
