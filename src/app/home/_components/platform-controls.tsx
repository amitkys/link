"use client";

import { Input } from "@/components/ui/input";
import { SortOption, ViewMode } from "@/store/use-user-preferences-store";
import {
  IconFolder,
  IconLayoutGrid,
  IconLayoutList,
  IconList,
  IconSearch,
  IconSortAscending,
} from "@tabler/icons-react";

interface PlatformControlsProps {
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function PlatformControls({
  title = "Platforms",
  subtitle = "Manage and view your saved platforms and link collections.",
  searchPlaceholder = "Search platforms...",
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: PlatformControlsProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-xs">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <IconFolder className="w-7 h-7 text-primary" />
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {subtitle}
        </p>
      </div>

      {/* Controls: Search, Sort, View Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative min-w-[200px] sm:w-64">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-background/80"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5 bg-background/80 border border-border rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground">
          <IconSortAscending className="w-3.5 h-3.5" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent border-none text-xs text-foreground focus:outline-hidden cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most-visited">Most Visited First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>

        {/* View Switcher Buttons */}
        <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border/40">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "grid"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid View"
          >
            <IconLayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "list"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
          >
            <IconList className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("compact")}
            className={`p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 cursor-pointer ${
              viewMode === "compact"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Compact View"
          >
            <IconLayoutList className="w-4 h-4" />
            <span className="hidden sm:inline">Compact</span>
          </button>
        </div>
      </div>
    </div>
  );
}
