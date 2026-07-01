"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

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

  const entityType = ENTITY_TYPES.includes(entityTypeRaw) ? entityTypeRaw : "OTHER";

  await prisma.client.create({
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
    },
  });

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");
}
