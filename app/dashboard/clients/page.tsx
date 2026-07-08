import { prisma } from "@/lib/db";
import ClientsDirectoryClient from "./ClientPage";
import { getFirmId } from "@/lib/auth-utils";

export default async function ClientsDirectoryPage() {
  const firmId = await getFirmId();
  if (!firmId) return null;

  const clients = await prisma.client.findMany({
    where: { firmId },
    orderBy: { createdAt: "desc" },
  });

  return <ClientsDirectoryClient initialClients={clients} />;
}
