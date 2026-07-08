import DocumentsClient from "./DocumentsClient";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFirmId } from "@/lib/auth-utils";

export default async function DocumentsPage() {
  const user = await currentUser();
  if (!user) redirect("/");
  const currentUserRole = user.publicMetadata?.role as string || "STAFF";

  const firmId = await getFirmId();
  if (!firmId) return null;

  const [documents, clients, dscs, udins] = await Promise.all([
    prisma.document.findMany({
      where: { firmId },
      include: {
        client: true,
        user: true,
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({
      where: { firmId },
      orderBy: { name: "asc" }
    }),
    prisma.digitalSignature.findMany({
      where: { firmId },
      include: { client: true },
      orderBy: { expiryDate: "asc" }
    }),
    prisma.udin.findMany({
      where: { firmId },
      include: { client: true, assignment: true },
      orderBy: { generatedAt: "desc" }
    })
  ]);

  return <DocumentsClient 
    documents={documents} 
    clients={clients} 
    dscs={dscs}
    udins={udins}
    currentUserRole={currentUserRole} 
    currentUserId={user.id} 
  />;
}
