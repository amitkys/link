import type { Metadata } from "next";
import { getGlobalPlatform } from "./lib/action";
import PlatformExplorer from "./_components/platform-explorer";

export const metadata: Metadata = {
  title: "Explore Platforms & Links",
  description: "Discover and explore categorized social platforms, link collections, and creators on Link.",
};

export default async function Page() {
  const result = await getGlobalPlatform();

  if (!result.success || !result.data) {
    return (
      <main className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{result.message}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-6 px-4">
      <PlatformExplorer platforms={result.data} />
    </main>
  );
}