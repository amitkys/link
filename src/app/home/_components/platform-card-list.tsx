"use client";

import type { Platform } from "@/app/home/query/get";
import { getPlatformDataQuery } from "@/app/home/query/get";
import { navigateClient } from "@/app/home/lib/navigate";
import { useRecordPlatformVisitMutation } from "@/app/home/query/update";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { IconCalendar, IconEye, IconFolder, IconPencil, IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface PlatformCardListProps {
  platform: Platform;
  onEdit?: (platform: Platform) => void;
  onDelete?: (platform: Platform) => void;
}

export function PlatformCardList({ platform, onEdit, onDelete }: PlatformCardListProps) {
  const queryClient = useQueryClient();
  const recordVisitMutation = useRecordPlatformVisitMutation();
  const [imgError, setImgError] = useState(false);

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
            className="flex items-center justify-between p-4 hover:bg-accent/30 transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 overflow-hidden">
                {platform.icon && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={platform.icon}
                    alt={platform.name}
                    onError={() => setImgError(true)}
                    className="w-4 h-4 object-contain"
                  />
                ) : (
                  <IconFolder className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors truncate">
                  {platform.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-6 shrink-0 text-xs text-muted-foreground">
              <span className="flex items-center gap-1 font-mono bg-muted/50 px-2 py-0.5 rounded-md">
                <IconEye className="w-3 h-3 text-primary" />
                {platform.visitedTimes || 0} visits
              </span>
              <span className="hidden sm:flex items-center gap-1 font-mono">
                <IconCalendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
              <span className="text-primary font-medium group-hover:underline">Open &rarr;</span>
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

