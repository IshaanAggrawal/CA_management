import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import DashboardHeaderClient from "./DashboardHeaderClient";

export default async function DashboardHeader() {
  const user = await currentUser();
  const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Welcome";
  const userRole = user?.publicMetadata?.role as string || "Staff";

  return <DashboardHeaderClient userName={userName} userRole={userRole} UserButton={UserButton} />;
}