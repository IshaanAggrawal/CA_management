import DocumentsClient from "./DocumentsClient";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  const user = await currentUser();
  if (!user) redirect("/");
  const currentUserRole = user.publicMetadata?.role as string || "STAFF";

  const [documents, clients, dscs, udins] = await Promise.all([
    prisma.document.findMany({
      include: {
        client: true,
        user: true,
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" }
    }),
    prisma.digitalSignature.findMany({
      include: { client: true },
      orderBy: { expiryDate: "asc" }
    }),
    prisma.udin.findMany({
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
