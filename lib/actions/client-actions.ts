"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function createClient(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const pan = formData.get("pan") as string;
  const gstin = formData.get("gstin") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;

  if (!name) throw new Error("Name is required");

  await prisma.client.create({
    data: {
      name,
      pan: pan || null,
      gstin: gstin || null,
      email: email || null,
      phone: phone || null,
    },
  });

  revalidatePath("/dashboard/clients");
}
