import {
  getPlatformAction,
  getUserPreferencesAction,
} from "@/app/home/lib/action";
import { queryOptions, useQuery } from "@tanstack/react-query";

export function getPlatformQuery() {
  return queryOptions({
    queryKey: ["get-platform"],
    queryFn: async () => {
      const res = await getPlatformAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetPlatformQuery() {
  return useQuery(getPlatformQuery());
}

export type Platform = NonNullable<ReturnType<typeof useGetPlatformQuery>["data"]>[number];

export function getUserPreferencesQuery() {
  return queryOptions({
    queryKey: ["get-user-preferences"],
    queryFn: async () => {
      const res = await getUserPreferencesAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });
}

export function useGetUserPreferencesQuery() {
  return useQuery(getUserPreferencesQuery());
}

export type UserPreferences = NonNullable<ReturnType<typeof useGetUserPreferencesQuery>["data"]>;
