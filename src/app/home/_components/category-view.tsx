"use client";

import type { Category } from "@/app/home/query/get";
import { useGetPlatformDataQuery } from "@/app/home/query/get";
import {
  useRecordCategoryVisitMutation,
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
  IconCalendar,
  IconExternalLink,
  IconEye,
  IconFolder,
  IconFolderOpen,
  IconLink,
  IconPlus,
  IconRefresh,
} from "@tabler/icons-react";
import { navigateClient } from "@/app/home/lib/navigate";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { PlatformControls } from "./platform-controls";

interface CategoryViewProps {
  platformId: string;
}

/**
 * Displays categories/subcategories and links with full sorting, view mode, and visit count features.
 */
export function CategoryView({ platformId }: CategoryViewProps) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const viewMode = useViewMode();
  const sortBy = useSortBy();
  const { setViewMode, setSortBy } = usePreferencesActions();
  const updatePreferencesMutation = useUpdateUserPreferencesMutation();
  const recordCategoryVisitMutation = useRecordCategoryVisitMutation();

  const [searchQuery, setSearchQuery] = useState("");

  const categoryId = searchParams.get("category");

  // Fetch all categories and links for the platform in one fast parallel query
  const {
    data: platformData,
    isLoading: isPlatformDataLoading,
    isError,
    error,
    refetch,
  } = useGetPlatformDataQuery(platformId);

  const allCategories = platformData?.categories;
  const allLinks = platformData?.links;

  // Filter categories at current level (top-level if categoryId is null, subcategories if categoryId is set)
  const currentLevelCategories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter((c) =>
      categoryId ? c.parentId === categoryId : !c.parentId
    );
  }, [allCategories, categoryId]);

  // Filter links at current level (top-level if categoryId is null, subcategory links if categoryId is set)
  const currentLevelLinks = useMemo(() => {
    if (!allLinks) return [];
    return allLinks.filter((l) =>
      categoryId ? l.categoryId === categoryId : !l.categoryId
    );
  }, [allLinks, categoryId]);

  const isLoading = isPlatformDataLoading && !platformData;
  const errorMessage = error?.message || "Failed to load data";

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    updatePreferencesMutation.mutate({ viewMode: mode, sortBy });
  };

  const handleSortByChange = (sort: SortOption) => {
    setSortBy(sort);
    updatePreferencesMutation.mutate({ viewMode, sortBy: sort });
  };

  const handleCategoryClick = (category: Category) => {
    recordCategoryVisitMutation.mutate(category.id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("category", category.id);
    navigateClient(`/home?${params.toString()}`);
  };

  const handleCategoryHover = (category: Category) => {
    queryClient.prefetchQuery(getLinksQuery({ platformId, categoryId: category.id }));
  };

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    if (!currentLevelCategories) return [];

    let result = [...currentLevelCategories];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

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
      return timeB - timeA;
    });

    return result;
  }, [currentLevelCategories, searchQuery, sortBy]);

  // Filter links by search query
  const filteredLinks = useMemo(() => {
    if (!currentLevelLinks) return [];
    if (!searchQuery.trim()) return currentLevelLinks;
    const q = searchQuery.toLowerCase().trim();
    return currentLevelLinks.filter(
      (l) => (l.title && l.title.toLowerCase().includes(q)) || l.url.toLowerCase().includes(q)
    );
  }, [currentLevelLinks, searchQuery]);

  if (isLoading) {
    return <CategorySkeleton viewMode={viewMode} />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 bg-destructive/5 rounded-2xl space-y-4">
        <IconAlertCircle className="w-12 h-12 text-destructive" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Failed to load</h3>
          <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
        </div>
        <Button
          onClick={() => {
            refetch();
          }}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <IconRefresh className="w-4 h-4" />
          Try Again
        </Button>
      </div>
    );
  }

  const hasCategories = filteredAndSortedCategories.length > 0;
  const hasLinks = filteredLinks.length > 0;
  const isEmpty = !hasCategories && !hasLinks;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Controls Header */}
      <PlatformControls
        title={categoryId ? "Subcategories" : "Categories"}
        subtitle="Manage and browse categories, subcategories, and link collections."
        searchPlaceholder="Search categories & links..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={handleSortByChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center p-14 text-center border border-dashed border-border rounded-2xl space-y-4 bg-card/30">
          <div className="p-4 rounded-full bg-primary/10 text-primary">
            <IconFolderOpen className="w-10 h-10" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No matches found" : "Nothing here yet"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No categories or links match "${searchQuery}".`
                : `This ${categoryId ? "category" : "hub"} doesn't have any subcategories or links yet.`}
            </p>
          </div>
          {searchQuery ? (
            <Button onClick={() => setSearchQuery("")} variant="ghost" size="sm">
              Clear Search
            </Button>
          ) : (
            <Button size="sm" className="gap-2">
              <IconPlus className="w-4 h-4" />
              Add Category
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Categories Section */}
          {hasCategories && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <IconFolder className="w-3.5 h-3.5 text-primary" />
                  {filteredAndSortedCategories.length}{" "}
                  {categoryId ? "subcategorie" : "categorie"}
                  {filteredAndSortedCategories.length === 1 ? "" : "s"}
                </span>
              </div>

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredAndSortedCategories.map((category) => (
                    <CategoryCardGrid
                      key={category.id}
                      category={category}
                      onClick={handleCategoryClick}
                      onHover={handleCategoryHover}
                    />
                  ))}
                </div>
              )}

              {/* List View */}
              {viewMode === "list" && (
                <div className="flex flex-col divide-y divide-border/60 border border-border/60 rounded-xl bg-card/40 overflow-hidden">
                  {filteredAndSortedCategories.map((category) => (
                    <CategoryCardList
                      key={category.id}
                      category={category}
                      onClick={handleCategoryClick}
                      onHover={handleCategoryHover}
                    />
                  ))}
                </div>
              )}

              {/* Compact View */}
              {viewMode === "compact" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {filteredAndSortedCategories.map((category) => (
                    <CategoryCardCompact
                      key={category.id}
                      category={category}
                      onClick={handleCategoryClick}
                      onHover={handleCategoryHover}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Links Section */}
          {hasLinks && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1 font-medium">
                <IconLink className="w-3.5 h-3.5 text-primary" />
                <span>
                  {filteredLinks.length} link{filteredLinks.length === 1 ? "" : "s"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLinks.map((link) => (
                  <LinkCard key={link.id} link={link} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category Cards ───────────────────────────────────────────

function CategoryCardGrid({
  category,
  onClick,
  onHover,
}: {
  category: Category;
  onClick: (c: Category) => void;
  onHover: (c: Category) => void;
}) {
  const formattedDate = new Date(category.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={() => onClick(category)}
      onMouseEnter={() => onHover(category)}
      className="group relative flex flex-col justify-between bg-card hover:bg-accent/40 border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <IconFolder className="w-5 h-5" />
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
            <IconCalendar className="w-3 h-3" />
            {formattedDate}
          </span>
        </div>

        <div>
          <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
        <span className="group-hover:text-foreground transition-colors font-medium">
          Explore category &rarr;
        </span>
        <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
          <IconEye className="w-3 h-3 text-primary" />
          {category.visitedTimes || 0} visits
        </span>
      </div>
    </div>
  );
}

function CategoryCardList({
  category,
  onClick,
  onHover,
}: {
  category: Category;
  onClick: (c: Category) => void;
  onHover: (c: Category) => void;
}) {
  const formattedDate = new Date(category.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      onClick={() => onClick(category)}
      onMouseEnter={() => onHover(category)}
      className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors group cursor-pointer"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <IconFolder className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {category.name}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-6 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1 font-mono bg-muted/50 px-2 py-0.5 rounded-md">
          <IconEye className="w-3 h-3 text-primary" />
          {category.visitedTimes || 0} visits
        </span>
        <span className="hidden sm:flex items-center gap-1 font-mono">
          <IconCalendar className="w-3.5 h-3.5" />
          {formattedDate}
        </span>
        <span className="text-primary font-medium group-hover:underline">Open &rarr;</span>
      </div>
    </div>
  );
}

function CategoryCardCompact({
  category,
  onClick,
  onHover,
}: {
  category: Category;
  onClick: (c: Category) => void;
  onHover: (c: Category) => void;
}) {
  return (
    <div
      onClick={() => onClick(category)}
      onMouseEnter={() => onHover(category)}
      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/40 hover:border-primary/40 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          <IconFolder className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate">
          {category.name}
        </span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-xs shrink-0 flex items-center gap-0.5">
        <IconEye className="w-2.5 h-2.5 text-primary" />
        {category.visitedTimes || 0}
      </span>
    </div>
  );
}

// ─── Link Card ───────────────────────────────────────────────

function LinkCard({
  link,
}: {
  link: {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    thumbnail: string | null;
    isFavorite: boolean;
    visitedTimes: number;
  };
}) {
  let displayTitle = link.title;
  if (!displayTitle) {
    try {
      displayTitle = new URL(link.url).hostname;
    } catch {
      displayTitle = link.url;
    }
  }

  const handleClick = () => {
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      onClick={handleClick}
      className="group relative flex flex-col justify-between bg-card hover:bg-accent/40 border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer min-w-0"
    >
      <div className="space-y-3 min-w-0">
        {link.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={link.thumbnail}
            alt={displayTitle}
            className="w-full h-32 object-cover rounded-lg"
          />
        )}

        <div className="flex items-center gap-2 min-w-0">
          <IconLink className="w-4 h-4 text-primary shrink-0" />
          <h3
            className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate min-w-0"
            title={displayTitle}
          >
            {displayTitle}
          </h3>
        </div>

        {link.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 break-words">
            {link.description}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground gap-2 min-w-0">
        <span
          className="truncate font-mono text-[11px] text-muted-foreground/80 shrink min-w-0"
          title={link.url}
        >
          {link.url}
        </span>
        <IconExternalLink className="w-3.5 h-3.5 text-primary shrink-0" />
      </div>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────

function CategorySkeleton({ viewMode }: { viewMode: ViewMode }) {
  const count = viewMode === "compact" ? 12 : 6;
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="h-24 rounded-2xl bg-card/60 border border-border/50 animate-pulse" />
      <div
        className={
          viewMode === "compact"
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
            : viewMode === "list"
            ? "space-y-3"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        }
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={
              viewMode === "list"
                ? "h-16 rounded-xl bg-card border border-border animate-pulse"
                : viewMode === "compact"
                ? "h-12 rounded-lg bg-card border border-border animate-pulse"
                : "h-36 rounded-xl bg-card border border-border animate-pulse"
            }
          />
        ))}
      </div>
    </div>
  );
}
