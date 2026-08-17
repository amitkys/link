import type { Metadata } from "next";
import HomeExplorer from "./_components/home-explorer";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Platforms",
  description: "View and manage your saved platforms on Link.",
};

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }
  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <HomeExplorer />
    </main>
  );
}