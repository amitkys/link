"use client";

import { useGetCategoriesQuery, useGetPlatformQuery } from "@/app/home/query/get";
import { IconChevronRight, IconHome } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

interface BreadcrumbSegment {
  label: string;
  href: string;
}

/**
 * Renders a clickable breadcrumb trail based on current URL search params.
 * Resolves names from TanStack Query cache for instant display (no extra fetches).
 */
export function Breadcrumb() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const platformId = searchParams.get("platform");
  const categoryId = searchParams.get("category");

  // Fetch platform data from cache (already loaded by PlatformView)
  const { data: platforms } = useGetPlatformQuery();

  // Fetch categories if we're inside a platform (used to resolve category name)
  const { data: categories } = useGetCategoriesQuery(platformId ?? "", categoryId ? undefined : undefined);

  // Also try fetching the parent-level categories if we have a categoryId
  // to find the category name in the data
  const { data: parentCategories } = useGetCategoriesQuery(
    platformId ?? "",
    undefined
  );

  const segments = useMemo(() => {
    const result: BreadcrumbSegment[] = [
      { label: "Platforms", href: "/home" },
    ];

    if (platformId) {
      const platform = platforms?.find((p) => p.id === platformId);
      result.push({
        label: platform?.name ?? "...",
        href: `/home?platform=${platformId}`,
      });
    }

    if (categoryId) {
      // Try to find the category name from loaded categories
      const allCategories = [...(categories ?? []), ...(parentCategories ?? [])];
      const category = allCategories.find((c) => c.id === categoryId);
      result.push({
        label: category?.name ?? "...",
        href: `/home?platform=${platformId}&category=${categoryId}`,
      });
    }

    return result;
  }, [platformId, categoryId, platforms, categories, parentCategories]);

  const handleNavigate = (href: string) => {
    router.push(href, { scroll: false });
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
