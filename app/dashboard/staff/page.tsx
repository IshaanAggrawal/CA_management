import { prisma } from "@/lib/db";
import StaffClient from "./StaffClient";

export default async function StaffPage() {
  const users = await prisma.user.findMany({
    include: {
      assignments: {
        where: {
          status: { not: "COMPLETED" }
        }
      }
    }
  });

  return <StaffClient users={users} />;
}
