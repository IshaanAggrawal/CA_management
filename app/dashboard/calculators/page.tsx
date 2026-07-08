import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CalculatorsClient from "./CalculatorsClient";

export default async function CalculatorsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  return <CalculatorsClient />;
}
