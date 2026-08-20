"use client";

import { navigateClient } from "@/app/home/lib/navigate";
import { useGetPlatformDataQuery, useGetPlatformQuery } from "@/app/home/query/get";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

/**
 * Renders a clickable breadcrumb trail based on current URL search params.
 * Resolves full multi-level parent category trails instantly from preloaded platform categories.
 */
export function Breadcrumb() {
  const searchParams = useSearchParams();

  const platformId = searchParams.get("platform");
  const categoryId = searchParams.get("category");

  // Fetch platform data from cache
  const { data: platforms } = useGetPlatformQuery();

  // Fetch all categories for the platform (already loaded by CategoryView via getPlatformDataQuery)
  const { data: platformData } = useGetPlatformDataQuery(platformId ?? "");
  const categories = platformData?.categories;

  const segments = useMemo(() => {
    const result: BreadcrumbSegment[] = [
      { label: "Hubs", href: "/home" },
    ];

    if (platformId) {
      const platform = platforms?.find((p) => p.id === platformId);
      result.push({
        label: platform?.name ?? "...",
        href: `/home?platform=${platformId}`,
      });
    }

    if (categoryId && categories) {
      // Trace parent category trail from target category up to top-level
      const categoryTrail: Array<{ id: string; name: string }> = [];
      let currentId: string | null | undefined = categoryId;
      const visited = new Set<string>();

      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const cat = categories.find((c) => c.id === currentId);
        if (!cat) break;
        categoryTrail.unshift({ id: cat.id, name: cat.name });
        currentId = cat.parentId;
      }

      for (const cat of categoryTrail) {
        result.push({
          label: cat.name,
          href: `/home?platform=${platformId}&category=${cat.id}`,
        });
      }
    }

    return result;
  }, [platformId, categoryId, platforms, categories]);

  const handleNavigate = (href: string) => {
    navigateClient(href);
  };

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto pb-1">
      <button
        onClick={() => handleNavigate("/home")}
        className="shrink-0 p-1 rounded-md hover:bg-accent/60 hover:text-foreground transition-colors"
        aria-label="Home"
      >
        <IconHome className="w-4 h-4" />
      </button>

      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        return (
          <div key={segment.href} className="flex items-center gap-1.5 min-w-0">
            <IconChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-medium text-foreground truncate">{segment.label}</span>
            ) : (
              <button
                onClick={() => handleNavigate(segment.href)}
                className="truncate hover:text-foreground hover:underline underline-offset-4 transition-colors"
              >
                {segment.label}
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}

