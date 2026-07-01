import DocumentsClient from "./DocumentsClient";
import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DocumentsPage() {
  const user = await currentUser();
  if (!user) redirect("/");
  const currentUserRole = user.publicMetadata?.role as string || "STAFF";

  const [documents, clients] = await Promise.all([
    prisma.document.findMany({
      include: {
        client: true,
        user: true,
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.client.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  return <DocumentsClient documents={documents} clients={clients} currentUserRole={currentUserRole} currentUserId={user.id} />;
}
