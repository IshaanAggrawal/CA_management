"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { getFirmId } from "@/lib/auth-utils";

type ClientEntityType = "CORPORATE" | "INDIVIDUAL" | "LLP" | "OTHER";

const ENTITY_TYPES: ClientEntityType[] = ["CORPORATE", "INDIVIDUAL", "LLP", "OTHER"];

const getStringField = (formData: FormData, key: string) => {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
};

const normalizeOptional = (value: string) => (value.length > 0 ? value : null);

export async function createClient(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized: User does not belong to a firm");

  const name = getStringField(formData, "name");
  const entityTypeRaw = getStringField(formData, "entityType").toUpperCase() as ClientEntityType;
  const partnerName = getStringField(formData, "partnerName");
  const contactPerson = getStringField(formData, "contactPerson");
  const city = getStringField(formData, "city");
  const pan = getStringField(formData, "pan");
  const gstin = getStringField(formData, "gstin");
  const email = getStringField(formData, "email");
  const phone = getStringField(formData, "phone");

  if (!name) throw new Error("Name is required");

  // Check Firm subscription limits here before creating
  const firm = await prisma.firm.findUnique({ where: { id: firmId }, select: { planTier: true } });
  if (!firm) throw new Error("Firm not found");

  const count = await prisma.client.count({ where: { firmId } });
  
  const limits = {
    FREE: 5,
    PRO: 100,
    ENTERPRISE: Infinity
  };
  
  const maxClients = limits[firm.planTier as keyof typeof limits] || limits.FREE;
  if (count >= maxClients) {
    throw new Error(`Client limit reached for ${firm.planTier} plan. Please upgrade to add more.`);
  }

  const entityType = ENTITY_TYPES.includes(entityTypeRaw) ? entityTypeRaw : "OTHER";

  const client = await prisma.client.create({
    data: {
      name,
      entityType,
      partnerName: normalizeOptional(partnerName),
      contactPerson: normalizeOptional(contactPerson),
      city: normalizeOptional(city),
      pan: normalizeOptional(pan),
      gstin: normalizeOptional(gstin),
      email: normalizeOptional(email),
      phone: normalizeOptional(phone),
      firmId
    },
  });

  await prisma.activityLog.create({
    data: {
      action: "CREATED",
      entityType: "CLIENT",
      entityId: client.id,
      details: `Created client "${name}"`,
      userId: user.id,
      firmId
    }
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
}

export async function bulkDeleteClients(ids: string[]) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");
  
  const firmId = await getFirmId();
  if (!firmId) throw new Error("Unauthorized: User does not belong to a firm");

  // Basic RBAC: only ADMIN can delete
  if (user.publicMetadata?.role === "STAFF") throw new Error("Unauthorized");

  await prisma.client.deleteMany({
    where: {
      id: { in: ids },
      firmId
    }
  });

  await prisma.activityLog.create({
    data: {
      action: "DELETED",
      entityType: "CLIENT",
      entityId: "bulk",
      details: `Deleted ${ids.length} clients`,
      userId: user.id,
      firmId
    }
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
}
