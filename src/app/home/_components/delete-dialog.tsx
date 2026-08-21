"use client";

import {
  useDeleteCategoryMutation,
  useDeleteLinkMutation,
  useDeletePlatformMutation,
} from "@/app/home/query/delete";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconAlertTriangle } from "@tabler/icons-react";
import { toast } from "sonner";

export type DeleteTarget =
  | { type: "platform"; id: string; name: string }
  | {
      type: "category";
      id: string;
      name: string;
      isSubdirectory?: boolean;
      platformId?: string;
    }
  | { type: "link"; id: string; name: string; platformId?: string };

interface DeleteDialogProps {
  item: DeleteTarget | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({ item, open, onOpenChange }: DeleteDialogProps) {
  const deletePlatformMutation = useDeletePlatformMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const deleteLinkMutation = useDeleteLinkMutation();

  const isPending =
    deletePlatformMutation.isPending ||
    deleteCategoryMutation.isPending ||
    deleteLinkMutation.isPending;

  if (!item) return null;

  const getItemTypeName = () => {
    if (item.type === "platform") return "Hub";
    if (item.type === "category")
      return item.isSubdirectory ? "Subdirectory" : "Directory";
    return "Link";
  };

  const handleConfirmDelete = () => {
    const typeName = getItemTypeName();

    if (item.type === "platform") {
      deletePlatformMutation.mutate(item.id, {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(`${typeName} "${item.name}" deleted successfully`);
            onOpenChange(false);
          } else {
            toast.error(res.message || `Failed to delete ${typeName}`);
          }
        },
      });
    } else if (item.type === "category") {
      deleteCategoryMutation.mutate(
        { id: item.id, platformId: item.platformId },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(`${typeName} "${item.name}" deleted successfully`);
              onOpenChange(false);
            } else {
              toast.error(res.message || `Failed to delete ${typeName}`);
            }
          },
        }
      );
    } else if (item.type === "link") {
      deleteLinkMutation.mutate(
        { id: item.id, platformId: item.platformId },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(`Link "${item.name}" deleted successfully`);
              onOpenChange(false);
            } else {
              toast.error(res.message || "Failed to delete link");
            }
          },
        }
      );
    }
  };

  const itemTypeName = getItemTypeName();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-1">
            <IconAlertTriangle className="size-5 shrink-0" />
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Delete {itemTypeName}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-muted-foreground text-left">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              "{item.name}"
            </span>
            ? This action cannot be undone and will permanently remove this item
            {item.type !== "link" ? " and its contents." : "."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              handleConfirmDelete();
            }}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
