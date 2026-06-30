import { prisma } from "@/lib/db";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const assignments = await prisma.assignment.findMany({
    where: {
      deadline: {
        not: null
      }
    },
    include: { client: true, user: true },
    orderBy: { deadline: "asc" }
  });

  return <CalendarClient assignments={assignments} />;
}
