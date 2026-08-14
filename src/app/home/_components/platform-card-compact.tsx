"use client";

import type { Platform } from "@/app/home/query/get";
import { getCategoriesQuery } from "@/app/home/query/get";
import { useRecordPlatformVisitMutation } from "@/app/home/query/update";
import { IconFolder } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface PlatformCardCompactProps {
  platform: Platform;
}

export function PlatformCardCompact({ platform }: PlatformCardCompactProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const recordVisitMutation = useRecordPlatformVisitMutation();

  const handleClick = () => {
    recordVisitMutation.mutate(platform.id);
    router.push(`/home?platform=${platform.id}`, { scroll: false });
  };

  const handleMouseEnter = () => {
    queryClient.prefetchQuery(getCategoriesQuery(platform.id));
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/40 hover:border-primary/40 transition-all group cursor-pointer"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
          {platform.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={platform.icon} alt={platform.name} className="w-3.5 h-3.5 object-contain" />
          ) : (
            <IconFolder className="w-3.5 h-3.5" />
          )}
        </div>
        <span className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate">
          {platform.name}
        </span>
      </div>
      <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded-xs shrink-0">
        {platform.visitedTimes || 0}
      </span>
    </div>
  );
}
