"use client";

import type { Platform } from "@/app/home/query/get";
import { getPlatformDataQuery } from "@/app/home/query/get";
import { useRecordPlatformVisitMutation } from "@/app/home/query/update";
import { navigateClient } from "@/app/home/lib/navigate";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { PlatformIcon } from "@/app/home/_components/platform-icon";
import { IconCalendar, IconEye, IconPencil, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

interface PlatformCardGridProps {
  platform: Platform;
  onEdit?: (platform: Platform) => void;
  onDelete?: (platform: Platform) => void;
}

export function PlatformCardGrid({ platform, onEdit, onDelete }: PlatformCardGridProps) {
  const queryClient = useQueryClient();
  const recordVisitMutation = useRecordPlatformVisitMutation();

  const formattedDate = new Date(platform.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleClick = () => {
    recordVisitMutation.mutate(platform.id);
    navigateClient(`/home?platform=${platform.id}`);
  };

  const handleMouseEnter = () => {
    queryClient.prefetchQuery(getPlatformDataQuery(platform.id));
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={
          <div
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            className="group relative flex flex-col justify-between bg-card hover:bg-accent/40 border border-border hover:border-primary/40 rounded-xl p-5 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                  <PlatformIcon icon={platform.icon} name={platform.name} iconClassName="w-5 h-5" />
                </div>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                  <IconCalendar className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {platform.name}
                </h3>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
              <span className="group-hover:text-foreground transition-colors font-medium">
                Explore hub &rarr;
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                <IconEye className="w-3 h-3 text-primary" />
                {platform.visitedTimes || 0} visits
              </span>
            </div>
          </div>
        }
      />
      <ContextMenuContent className="w-44">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(platform);
          }}
        >
          <IconPencil className="mr-2 size-4" />
          Edit Hub
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(platform);
          }}
        >
          <IconTrash className="mr-2 size-4" />
          Delete Hub
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

