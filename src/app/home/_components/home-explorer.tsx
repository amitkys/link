"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { Breadcrumb } from "./breadcrumb";
import { CategoryView } from "./category-view";
import PlatformView from "./platform-view";

/**
 * Top-level orchestrator for /home.
 * Reads URL search params and renders the correct view level.
 *
 * No params        → PlatformView (all platforms)
 * ?platform=X      → CategoryView (top-level categories + uncategorized links)
 * ?platform=X&category=Y → CategoryView (subcategories + links of that category)
 */
function HomeExplorerContent() {
  const searchParams = useSearchParams();
  const platformId = searchParams.get("platform");

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Breadcrumb — only show when drilled into a platform */}
      {platformId && <Breadcrumb />}

      {/* View Switcher */}
      {!platformId ? (
        <PlatformView />
      ) : (
        <CategoryView platformId={platformId} />
      )}
    </div>
  );
}

/**
 * Wraps content in Suspense since useSearchParams requires it in Next.js App Router.
 */
export default function HomeExplorer() {
  return (
    <Suspense fallback={<HomeExplorerFallback />}>
      <HomeExplorerContent />
    </Suspense>
  );
}

function HomeExplorerFallback() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-36 rounded-xl bg-card border border-border animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
