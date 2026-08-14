"use client";

import { ViewMode } from "@/store/use-user-preferences-store";

interface PlatformSkeletonProps {
  viewMode: ViewMode;
}

export function PlatformSkeleton({ viewMode }: PlatformSkeletonProps) {
  const items = Array.from({ length: 6 });

  if (viewMode === "list") {
    return (
      <div className="flex flex-col divide-y divide-border/60 border border-border/60 rounded-xl bg-card/40 overflow-hidden animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <div className="w-28 h-4 bg-muted rounded-sm" />
                <div className="w-16 h-3 bg-muted/60 rounded-sm" />
              </div>
            </div>
            <div className="w-20 h-4 bg-muted/60 rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === "compact") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 animate-pulse">
        {items.map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 p-3 rounded-lg border border-border bg-card">
            <div className="w-7 h-7 rounded-md bg-muted shrink-0" />
            <div className="w-16 h-3.5 bg-muted rounded-sm" />
          </div>
        ))}
      </div>
    );
  }

  // Grid Skeleton
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
      {items.map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-muted" />
            <div className="w-20 h-3 bg-muted/60 rounded-sm" />
          </div>
          <div className="space-y-2">
            <div className="w-32 h-5 bg-muted rounded-sm" />
            <div className="w-20 h-3.5 bg-muted/60 rounded-sm" />
          </div>
          <div className="pt-3 border-t border-border/40 flex justify-between">
            <div className="w-24 h-3 bg-muted/60 rounded-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}
