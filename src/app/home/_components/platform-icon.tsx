"use client";

import { getIconSrc } from "@/app/home/lib/icon-utils";
import { cn } from "@/lib/utils";
import { IconFolder } from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface PlatformIconProps {
  icon?: string | null;
  name?: string;
  iconClassName?: string;
  fallback?: React.ReactNode;
}

/**
 * Reusable icon component for Platforms/Hubs.
 * Renders icons seamlessly whether stored as HTTP URLs, Base64 SVG Data URIs, or raw SVG strings,
 * with automatic image load error handling and fallback icons.
 */
export function PlatformIcon({
  icon,
  name,
  iconClassName = "w-5 h-5",
  fallback,
}: PlatformIconProps) {
  const [imgError, setImgError] = useState(false);
  const src = getIconSrc(icon);

  // Reset image error state whenever icon changes
  useEffect(() => {
    setImgError(false);
  }, [icon]);

  if (src && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "Hub icon"}
        onError={() => setImgError(true)}
        className={cn("object-contain shrink-0", iconClassName)}
      />
    );
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return <IconFolder className={cn("shrink-0", iconClassName)} />;
}
