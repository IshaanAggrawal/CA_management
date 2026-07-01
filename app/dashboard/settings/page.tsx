import { prisma } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const authUser = await currentUser();
  if (!authUser) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: authUser.id }
  });

  if (!user) redirect("/");

  const userData = {
    name: user.name,
    email: user.email,
    role: user.role
  };

  return <SettingsClient user={userData} />;
}
