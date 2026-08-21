"use client";

import {
  useCreateCategoryMutation,
  useCreateLinkMutation,
  useCreatePlatformMutation,
} from "@/app/home/query/create";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconFolderPlus,
  IconLayoutGrid,
  IconLink,
  IconPlus,
  IconSitemap,
} from "@tabler/icons-react";
import { detectIconType } from "@/app/home/lib/icon-utils";
import { PlatformIcon } from "@/app/home/_components/platform-icon";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function CreateSheet() {
  const searchParams = useSearchParams();
  const platformId = searchParams.get("platform");
  const categoryId = searchParams.get("category");

  // State for Directory / Platform sheet
  const [openFolder, setOpenFolder] = useState(false);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");

  // State for Link sheet
  const [openLink, setOpenLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");

  const createPlatformMutation = useCreatePlatformMutation();
  const createCategoryMutation = useCreateCategoryMutation();
  const createLinkMutation = useCreateLinkMutation();

  const isCreatingPlatform = !platformId;
  const isCreatingSubdirectory = Boolean(platformId && categoryId);

  const isFolderPending =
    createPlatformMutation.isPending || createCategoryMutation.isPending;
  const isLinkPending = createLinkMutation.isPending;

  // Enable Keyboard Lock API for Chromium (Chrome/Edge/Brave) when installed/fullscreen
  useEffect(() => {
    if (typeof window !== "undefined" && "keyboard" in navigator) {
      try {
        (navigator as Record<string, any>).keyboard
          ?.lock?.(["KeyN", "KeyL"])
          .catch(() => {});
      } catch {}
    }
  }, []);

  // Shortcut key handler: 'N' key (Single 'N', Alt+N, Alt+Shift+N, or Ctrl+Shift+N) for Directory / Platform
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[role='dialog']") ||
          target.closest("[data-slot='sheet-content']"))
      ) {
        return;
      }

      const isN = e.key === "N" || e.key === "n" || e.code === "KeyN";
      if (!isN) return;

      // Ignore bare Ctrl+N / Cmd+N (which opens browser new window)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
      }

      setOpenFolder((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, []);

  // Shortcut key handler: 'L' key (Single 'L', Alt+L, Alt+Shift+L, or Ctrl+Shift+L) for Link (only inside a platform)
  useEffect(() => {
    if (!platformId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest("[role='dialog']") ||
          target.closest("[data-slot='sheet-content']"))
      ) {
        return;
      }

      const isL = e.key === "L" || e.key === "l" || e.code === "KeyL";
      if (!isL) return;

      // Ignore bare Ctrl+L / Cmd+L (which focuses browser address bar)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === "function") {
        e.stopImmediatePropagation();
      }

      setOpenLink((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [platformId]);

  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.error("Please enter a name");
      return;
    }

    if (isCreatingPlatform) {
      createPlatformMutation.mutate(
        { name: trimmedName, icon: iconUrl.trim() || undefined },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(`Platform "${trimmedName}" created successfully!`);
              setName("");
              setIconUrl("");
              setOpenFolder(false);
            } else {
              toast.error(res.message || "Failed to create platform");
            }
          },
        }
      );
    } else if (platformId) {
      createCategoryMutation.mutate(
        {
          name: trimmedName,
          platformId,
          parentId: categoryId ?? null,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              const itemType = isCreatingSubdirectory ? "Subdirectory" : "Directory";
              toast.success(`${itemType} "${trimmedName}" created successfully!`);
              setName("");
              setIconUrl("");
              setOpenFolder(false);
            } else {
              toast.error(res.message || "Failed to create directory");
            }
          },
        }
      );
    }
  };

  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = linkUrl.trim();

    if (!trimmedUrl) {
      toast.error("Please enter a URL");
      return;
    }

    if (!platformId) return;

    createLinkMutation.mutate(
      {
        platformId,
        categoryId: categoryId ?? null,
        url: trimmedUrl,
        title: linkTitle.trim() || undefined,
        description: linkDescription.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Link saved successfully!");
            setLinkUrl("");
            setLinkTitle("");
            setLinkDescription("");
            setOpenLink(false);
          } else {
            toast.error(res.message || "Failed to save link");
          }
        },
      }
    );
  };

  const getFolderHeaderInfo = () => {
    if (isCreatingPlatform) {
      return {
        title: "Create Hub / Platform",
        icon: <IconLayoutGrid className="size-5 text-primary shrink-0" />,
        badge: "Root Hub",
        placeholder: "e.g. Instagram, GitHub, Personal",
      };
    }
    if (isCreatingSubdirectory) {
      return {
        title: "Create Subdirectory",
        icon: <IconSitemap className="size-5 text-indigo-500 dark:text-indigo-400 shrink-0" />,
        badge: "Subdirectory",
        placeholder: "e.g. Memes, Tutorials, Inspiration",
      };
    }
    return {
      title: "Create Directory",
      icon: <IconFolderPlus className="size-5 text-amber-500 dark:text-amber-400 shrink-0" />,
      badge: "Directory Folder",
      placeholder: "e.g. Entertainment, Development, Tech",
    };
  };

  const folderHeader = getFolderHeaderInfo();

  return (
    <>
      {/* ─── Create Link Button & Sheet (Only visible inside a platform) ─── */}
      {platformId && (
        <Sheet open={openLink} onOpenChange={setOpenLink}>
          <Tooltip>
            <TooltipTrigger
              render={
                <SheetTrigger
                  render={
                    <Button
                      variant="secondary"
                      size="icon"
                      className="fixed bottom-20 right-6 z-40 size-11 rounded-xl shadow-md border border-border/80 transition-colors"
                      aria-label="Create link"
                    />
                  }
                >
                  <IconLink className="size-5" />
                </SheetTrigger>
              }
            />
            <TooltipContent side="left" className="flex items-center gap-2">
              <span>Create Link</span>
              <kbd className="text-[10px] font-mono border border-background/30 bg-background/20 px-1.5 py-0.5 rounded">
                L
              </kbd>
            </TooltipContent>
          </Tooltip>

          <SheetContent
            side="top"
            className="w-full max-w-2xl mx-auto rounded-b-2xl border-b border-x border-border/80 shadow-2xl bg-background/95 backdrop-blur-md p-6"
          >
            <SheetHeader className="p-0 mb-4">
              <div className="flex items-center gap-2.5 pr-8">
                <IconLink className="size-5 text-emerald-500 shrink-0" />
                <SheetTitle className="text-lg font-bold">Create Link</SheetTitle>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border shrink-0">
                  {categoryId ? "In Subdirectory" : "In Platform"}
                </span>
              </div>
            </SheetHeader>

            <form onSubmit={handleLinkSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="link-url" className="text-xs font-semibold">
                  URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="link-url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                  disabled={isLinkPending}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link-title" className="text-xs font-semibold">
                  Title <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="link-title"
                  placeholder="e.g. Useful Reference Article"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  disabled={isLinkPending}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="link-desc" className="text-xs font-semibold">
                  Description <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Input
                  id="link-desc"
                  placeholder="Short note or context about this link"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  disabled={isLinkPending}
                  className="bg-card"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
                <SheetClose
                  render={
                    <Button type="button" variant="outline" size="sm" disabled={isLinkPending}>
                      Cancel
                    </Button>
                  }
                />
                <Button type="submit" size="sm" disabled={isLinkPending || !linkUrl.trim()}>
                  {isLinkPending ? "Saving..." : "Save Link"}
                </Button>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      )}

      {/* ─── Create Directory / Platform Button & Sheet (Always visible) ─── */}
      <Sheet open={openFolder} onOpenChange={setOpenFolder}>
        <Tooltip>
          <TooltipTrigger
            render={
              <SheetTrigger
                render={
                  <Button
                    variant="secondary"
                    size="icon"
                    className="fixed bottom-6 right-6 z-40 size-11 rounded-xl shadow-md border border-border/80 transition-colors"
                    aria-label="Create item"
                  />
                }
              >
                <IconPlus className="size-5" />
              </SheetTrigger>
            }
          />
          <TooltipContent side="left" className="flex items-center gap-2">
            <span>{folderHeader.title}</span>
            <kbd className="text-[10px] font-mono border border-background/30 bg-background/20 px-1.5 py-0.5 rounded">
              N
            </kbd>
          </TooltipContent>
        </Tooltip>

        <SheetContent
          side="top"
          className="w-full max-w-2xl mx-auto rounded-b-2xl border-b border-x border-border/80 shadow-2xl bg-background/95 backdrop-blur-md p-6"
        >
          <SheetHeader className="p-0 mb-4">
            <div className="flex items-center gap-2.5 pr-8">
              {folderHeader.icon}
              <SheetTitle className="text-lg font-bold">{folderHeader.title}</SheetTitle>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border shrink-0">
                {folderHeader.badge}
              </span>
            </div>
          </SheetHeader>

          <form onSubmit={handleFolderSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="item-name" className="text-xs font-semibold">
                {isCreatingPlatform ? "Platform Name" : isCreatingSubdirectory ? "Subdirectory Name" : "Directory Name"}
              </Label>
              <Input
                id="item-name"
                placeholder={folderHeader.placeholder}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                disabled={isFolderPending}
                className="bg-card"
              />
            </div>

            {isCreatingPlatform && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="icon-url" className="text-xs font-semibold">
                    Icon <span className="text-muted-foreground font-normal">(URL or SVG Code - Optional)</span>
                  </Label>
                  {detectIconType(iconUrl) !== "none" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                      {detectIconType(iconUrl) === "svg" ? "SVG Code" : "Image Link"}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <textarea
                      id="icon-url"
                      placeholder="Paste image URL (https://...) or raw SVG code (<svg>...)"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                      disabled={isFolderPending}
                      rows={2}
                      className="w-full rounded-md border border-input bg-card px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                    />
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex flex-col items-center justify-center shrink-0 shadow-xs p-1">
                    <PlatformIcon icon={iconUrl} name={name || "Preview"} iconClassName="size-6 text-primary" />
                    <span className="text-[9px] text-muted-foreground mt-0.5">Preview</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
              <SheetClose
                render={
                  <Button type="button" variant="outline" size="sm" disabled={isFolderPending}>
                    Cancel
                  </Button>
                }
              />
              <Button type="submit" size="sm" disabled={isFolderPending || !name.trim()}>
                {isFolderPending
                  ? "Creating..."
                  : isCreatingPlatform
                  ? "Create Platform"
                  : isCreatingSubdirectory
                  ? "Create Subdirectory"
                  : "Create Directory"}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}
