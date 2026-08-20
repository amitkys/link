import {
  createCategoryAction,
  createLinkAction,
  createPlatformAction,
} from "@/app/home/lib/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreatePlatformMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlatformAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-platform"] });
    },
  });
}

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCategoryAction,
    onSuccess: (res, variables) => {
      if (!res.success) return;
      queryClient.invalidateQueries({
        queryKey: ["get-all-categories", variables.platformId],
      });
      queryClient.invalidateQueries({
        queryKey: ["get-categories", variables.platformId],
      });
    },
  });
}

export function useCreateLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLinkAction,
    onSuccess: (res, variables) => {
      if (!res.success) return;
      queryClient.invalidateQueries({
        queryKey: ["get-links", variables.platformId],
      });
    },
  });
}

