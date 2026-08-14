import type { Metadata } from "next";
import HomeExplorer from "./_components/home-explorer";

export const metadata: Metadata = {
  title: "Platforms",
  description: "View and manage your saved platforms on Link.",
};

export default function Page() {
  return (
    <main className="min-h-screen p-4 md:p-8 bg-background">
      <HomeExplorer />
    </main>
  );
}