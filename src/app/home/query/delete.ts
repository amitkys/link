import {
  deleteCategoryAction,
  deleteLinkAction,
  deletePlatformAction,
} from "@/app/home/lib/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePlatformMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlatformAction(id),
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-platform"] });
      queryClient.invalidateQueries({ queryKey: ["get-platform-data"] });
    },
  });
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; platformId?: string }) => deleteCategoryAction(id),
    onSuccess: (res, variables) => {
      if (!res.success) return;
      if (variables.platformId) {
        queryClient.invalidateQueries({ queryKey: ["get-platform-data", variables.platformId] });
        queryClient.invalidateQueries({ queryKey: ["get-all-categories", variables.platformId] });
        queryClient.invalidateQueries({ queryKey: ["get-categories", variables.platformId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["get-platform-data"] });
        queryClient.invalidateQueries({ queryKey: ["get-all-categories"] });
        queryClient.invalidateQueries({ queryKey: ["get-categories"] });
      }
    },
  });
}

export function useDeleteLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; platformId?: string }) => deleteLinkAction(id),
    onSuccess: (res, variables) => {
      if (!res.success) return;
      if (variables.platformId) {
        queryClient.invalidateQueries({ queryKey: ["get-platform-data", variables.platformId] });
        queryClient.invalidateQueries({ queryKey: ["get-links", variables.platformId] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["get-platform-data"] });
        queryClient.invalidateQueries({ queryKey: ["get-links"] });
      }
    },
  });
}
