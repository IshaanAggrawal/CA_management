import { prisma } from "@/lib/db";
import StaffClient from "./StaffClient";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFirmId } from "@/lib/auth-utils";

export default async function StaffPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const currentUserId = user.id;
  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const currentUserRole = dbUser?.role || "STAFF";

  if (currentUserRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const firmId = await getFirmId();
  if (!firmId) return null;

  const [users, pendingAllocations] = await Promise.all([
    prisma.user.findMany({
      where: { firmId },
      include: {
        assignments: {
          where: {
            status: { not: "COMPLETED" },
            firmId
          }
        }
      },
      orderBy: { createdAt: "asc" }
    }),
    prisma.assignment.findMany({
      where: { userId: null, firmId },
      include: { client: true },
      orderBy: { deadline: "asc" }
    })
  ]);

  return <StaffClient users={users} currentUserId={currentUserId} currentUserRole={currentUserRole} pendingAllocations={pendingAllocations} />;
}
