"use client";

import {
  useGetPlatformQuery,
  useGetUserPreferencesQuery,
} from "@/app/home/query/get";
import {
  useRecordPlatformVisitMutation,
  useUpdateUserPreferencesMutation,
} from "@/app/home/query/update";
import { Button } from "@/components/ui/button";
import {
  SortOption,
  usePreferencesActions,
  useSortBy,
  useViewMode,
  ViewMode,
} from "@/store/use-user-preferences-store";
import {
  IconAlertCircle,
  IconFolder,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";

import { PlatformCardCompact } from "./platform-card-compact";
import { PlatformCardGrid } from "./platform-card-grid";
import { PlatformCardList } from "./platform-card-list";
import { PlatformControls } from "./platform-controls";
import { PlatformSkeleton } from "./platform-skeleton";

export default function PlatformView() {
  const { data: platforms, isLoading, isError, error, refetch } = useGetPlatformQuery();
  const { data: remotePreferences } = useGetUserPreferencesQuery();
  const updatePreferencesMutation = useUpdateUserPreferencesMutation();
  const recordVisitMutation = useRecordPlatformVisitMutation();

  const viewMode = useViewMode();
  const sortBy = useSortBy();
  const { setViewMode, setSortBy, setPreferences } = usePreferencesActions();

  const [searchQuery, setSearchQuery] = useState("");

  // Hydrate Zustand store from remote DB preferences on mount/login
  useEffect(() => {
    if (remotePreferences) {
      setPreferences({
        viewMode: remotePreferences.viewMode as ViewMode,
        sortBy: remotePreferences.sortBy as SortOption,
      });
    }
  }, [remotePreferences, setPreferences]);

  // Handler for changing view mode (Instant Zustand + LocalStorage update + DB background sync)
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updatePreferencesMutation.mutate({ viewMode: mode, sortBy });
  };

  // Handler for changing sort option (Instant Zustand + LocalStorage update + DB background sync)
  const handleSortByChange = (sort: SortOption) => {
    setSortBy(sort);
    updatePreferencesMutation.mutate({ viewMode, sortBy: sort });
  };

  // Handler when clicking a platform (optimistically updates UI by +1, records visit in Redis)
  const handlePlatformClick = (platformId: string) => {
    recordVisitMutation.mutate(platformId);
  };

  const filteredAndSortedPlatforms = useMemo(() => {
    if (!platforms) return [];

    let result = [...platforms];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Sort platforms
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "most-visited") {
        const visitsA = a.visitedTimes || 0;
        const visitsB = b.visitedTimes || 0;
        if (visitsA !== visitsB) return visitsB - visitsA;
      }

      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      if (sortBy === "oldest") {
        return timeA - timeB;
      }
      // default: newest
      return timeB - timeA;
    });

    return result;
  }, [platforms, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header & Controls */}
      <PlatformControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortByChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {/* Main Display Area */}
      {isLoading ? (
        <PlatformSkeleton viewMode={viewMode} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 bg-destructive/5 rounded-2xl space-y-4">
          <IconAlertCircle className="w-12 h-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">Failed to load platforms</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : "An error occurred while fetching platforms."}
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="gap-2">
            <IconRefresh className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      ) : filteredAndSortedPlatforms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-14 text-center border border-dashed border-border rounded-2xl space-y-4 bg-card/30">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <IconFolder className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No matching platforms" : "No platforms yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No platforms match "${searchQuery}". Try clearing your search query.`
                : "Create your first platform to start categorizing and organizing your links."}
            </p>
          </div>
          {searchQuery ? (
            <Button onClick={() => setSearchQuery("")} variant="ghost" size="sm">
              Clear Search
            </Button>
          ) : (
            <Button size="sm" className="gap-2">
              <IconPlus className="w-4 h-4" />
              Add Platform
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>
              Showing {filteredAndSortedPlatforms.length} platform
              {filteredAndSortedPlatforms.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* View Modes */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedPlatforms.map((platform) => (
                <PlatformCardGrid
                  key={platform.id}
                  platform={platform}
                  onPlatformClick={handlePlatformClick}
                />
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="flex flex-col divide-y divide-border/60 border border-border/60 rounded-xl bg-card/40 overflow-hidden">
              {filteredAndSortedPlatforms.map((platform) => (
                <PlatformCardList
                  key={platform.id}
                  platform={platform}
                  onPlatformClick={handlePlatformClick}
                />
              ))}
            </div>
          )}

          {viewMode === "compact" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filteredAndSortedPlatforms.map((platform) => (
                <PlatformCardCompact
                  key={platform.id}
                  platform={platform}
                  onPlatformClick={handlePlatformClick}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
