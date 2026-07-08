import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function requireFirmId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firmId: true }
  });
  
  if (!user || !user.firmId) {
    throw new Error("User does not belong to a firm");
  }
  
  return user.firmId;
}

export async function getFirmId() {
  try {
    return await requireFirmId();
  } catch (error) {
    return null;
  }
}
