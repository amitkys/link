import {
  recordCategoryVisitAction,
  recordPlatformVisitAction,
  updateUserPreferencesAction,
} from "@/app/home/lib/action";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateUserPreferencesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferencesAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-user-preferences"] });
    },
  });
}

export function useRecordPlatformVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordPlatformVisitAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-platform"] });
    },
  });
}

export function useRecordCategoryVisitMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recordCategoryVisitAction,
    onSuccess: (res) => {
      if (!res.success) return;
      queryClient.invalidateQueries({ queryKey: ["get-categories"] });
    },
  });
}
