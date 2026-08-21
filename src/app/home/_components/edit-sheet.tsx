"use client";

import {
  useUpdateCategoryMutation,
  useUpdateLinkMutation,
  useUpdatePlatformMutation,
} from "@/app/home/query/update";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  IconFolder,
  IconLayoutGrid,
  IconLink,
  IconPencil,
  IconSitemap,
} from "@tabler/icons-react";
import { detectIconType } from "@/app/home/lib/icon-utils";
import { PlatformIcon } from "@/app/home/_components/platform-icon";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export type EditTarget =
  | { type: "platform"; id: string; name: string; icon?: string | null }
  | {
      type: "category";
      id: string;
      name: string;
      isSubdirectory?: boolean;
      platformId?: string;
    }
  | {
      type: "link";
      id: string;
      url: string;
      title?: string | null;
      description?: string | null;
      platformId?: string;
    };

interface EditSheetProps {
  item: EditTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSheet({ item, open, onOpenChange }: EditSheetProps) {
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");

  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDescription, setLinkDescription] = useState("");

  const updatePlatformMutation = useUpdatePlatformMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const updateLinkMutation = useUpdateLinkMutation();

  const isPending =
    updatePlatformMutation.isPending ||
    updateCategoryMutation.isPending ||
    updateLinkMutation.isPending;

  useEffect(() => {
    if (!item) return;

    if (item.type === "platform") {
      setName(item.name || "");
      setIconUrl(item.icon || "");
    } else if (item.type === "category") {
      setName(item.name || "");
    } else if (item.type === "link") {
      setLinkUrl(item.url || "");
      setLinkTitle(item.title || "");
      setLinkDescription(item.description || "");
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (item.type === "platform") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        toast.error("Platform name is required");
        return;
      }

      updatePlatformMutation.mutate(
        {
          id: item.id,
          input: { name: trimmedName, icon: iconUrl.trim() || null },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(`Platform "${trimmedName}" updated successfully!`);
              onOpenChange(false);
            } else {
              toast.error(res.message || "Failed to update platform");
            }
          },
        }
      );
    } else if (item.type === "category") {
      const trimmedName = name.trim();
      if (!trimmedName) {
        toast.error("Category name is required");
        return;
      }

      updateCategoryMutation.mutate(
        {
          id: item.id,
          input: { name: trimmedName },
          platformId: item.platformId,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              const label = item.isSubdirectory ? "Subdirectory" : "Directory";
              toast.success(`${label} "${trimmedName}" updated successfully!`);
              onOpenChange(false);
            } else {
              toast.error(res.message || "Failed to update category");
            }
          },
        }
      );
    } else if (item.type === "link") {
      const trimmedUrl = linkUrl.trim();
      if (!trimmedUrl) {
        toast.error("URL is required");
        return;
      }

      updateLinkMutation.mutate(
        {
          id: item.id,
          input: {
            url: trimmedUrl,
            title: linkTitle.trim() || null,
            description: linkDescription.trim() || null,
          },
          platformId: item.platformId,
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success("Link updated successfully!");
              onOpenChange(false);
            } else {
              toast.error(res.message || "Failed to update link");
            }
          },
        }
      );
    }
  };

  const getHeaderInfo = () => {
    if (item.type === "platform") {
      return {
        title: "Edit Hub / Platform",
        icon: <IconLayoutGrid className="size-5 text-primary shrink-0" />,
        badge: "Root Hub",
      };
    }
    if (item.type === "category") {
      return {
        title: item.isSubdirectory ? "Edit Subdirectory" : "Edit Directory",
        icon: item.isSubdirectory ? (
          <IconSitemap className="size-5 text-indigo-500 shrink-0" />
        ) : (
          <IconFolder className="size-5 text-amber-500 shrink-0" />
        ),
        badge: item.isSubdirectory ? "Subdirectory" : "Directory Folder",
      };
    }
    return {
      title: "Edit Link",
      icon: <IconLink className="size-5 text-emerald-500 shrink-0" />,
      badge: "Link Item",
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="w-full max-w-2xl mx-auto rounded-b-2xl border-b border-x border-border/80 shadow-2xl bg-background/95 backdrop-blur-md p-6"
      >
        <SheetHeader className="p-0 mb-4">
          <div className="flex items-center gap-2.5 pr-8">
            {headerInfo.icon}
            <SheetTitle className="text-lg font-bold">
              {headerInfo.title}
            </SheetTitle>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground border border-border shrink-0">
              {headerInfo.badge}
            </span>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {item.type !== "link" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs font-semibold">
                  {item.type === "platform"
                    ? "Platform Name"
                    : item.isSubdirectory
                    ? "Subdirectory Name"
                    : "Directory Name"}
                </Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  disabled={isPending}
                  className="bg-card"
                />
              </div>

              {item.type === "platform" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-icon" className="text-xs font-semibold">
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
                        id="edit-icon"
                        placeholder="Paste image URL (https://...) or raw SVG code (<svg>...)"
                        value={iconUrl}
                        onChange={(e) => setIconUrl(e.target.value)}
                        disabled={isPending}
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
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="edit-url" className="text-xs font-semibold">
                  URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="edit-url"
                  type="url"
                  placeholder="https://example.com/article"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                  disabled={isPending}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-title" className="text-xs font-semibold">
                  Title{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="edit-title"
                  placeholder="e.g. Useful Reference Article"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  disabled={isPending}
                  className="bg-card"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-desc" className="text-xs font-semibold">
                  Description{" "}
                  <span className="text-muted-foreground font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="edit-desc"
                  placeholder="Short note or context about this link"
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  disabled={isPending}
                  className="bg-card"
                />
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/50">
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button
              type="submit"
              size="sm"
              disabled={
                isPending ||
                (item.type === "link" ? !linkUrl.trim() : !name.trim())
              }
            >
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
