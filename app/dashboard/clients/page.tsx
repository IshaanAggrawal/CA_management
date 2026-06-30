import { prisma } from "@/lib/db";
import ClientsDirectoryClient from "./ClientPage";

export default async function ClientsDirectoryPage() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <ClientsDirectoryClient initialClients={clients} />;
}
