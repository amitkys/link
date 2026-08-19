import {
  getAllCategoriesAction,
  getCategoriesAction,
  getLinksAction,
  getPlatformAction,
  getUserPreferencesAction,
} from "@/app/home/lib/action";
import { keepPreviousData, queryOptions, useQuery } from "@tanstack/react-query";

// ─── Platforms ───────────────────────────────────────────────

export function getPlatformQuery() {
  return queryOptions({
    queryKey: ["get-platform"],
    queryFn: async () => {
      const res = await getPlatformAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPlatformQuery() {
  return useQuery(getPlatformQuery());
}

export type Platform = NonNullable<ReturnType<typeof useGetPlatformQuery>["data"]>[number];

// ─── All Categories for Platform (Single Tree Query) ────────

export function getAllCategoriesQuery(platformId: string) {
  return queryOptions({
    queryKey: ["get-all-categories", platformId],
    queryFn: async () => {
      const res = await getAllCategoriesAction(platformId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!platformId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetAllCategoriesQuery(platformId: string) {
  return useQuery(getAllCategoriesQuery(platformId));
}

// ─── Categories ──────────────────────────────────────────────

export function getCategoriesQuery(platformId: string, parentId?: string | null) {
  return queryOptions({
    queryKey: ["get-categories", platformId, parentId ?? "root"],
    queryFn: async () => {
      const res = await getCategoriesAction(platformId, parentId);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!platformId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetCategoriesQuery(platformId: string, parentId?: string | null) {
  return useQuery(getCategoriesQuery(platformId, parentId));
}

export type Category = NonNullable<ReturnType<typeof useGetAllCategoriesQuery>["data"]>[number];

// ─── Links ───────────────────────────────────────────────────

export function getLinksQuery(params: { platformId: string; categoryId?: string | null }) {
  return queryOptions({
    queryKey: ["get-links", params.platformId, params.categoryId ?? "uncategorized"],
    queryFn: async () => {
      const res = await getLinksAction(params);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!params.platformId,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetLinksQuery(params: { platformId: string; categoryId?: string | null }) {
  return useQuery(getLinksQuery(params));
}

export type Link = NonNullable<ReturnType<typeof useGetLinksQuery>["data"]>[number];

// ─── User Preferences ───────────────────────────────────────

export function getUserPreferencesQuery() {
  return queryOptions({
    queryKey: ["get-user-preferences"],
    queryFn: async () => {
      const res = await getUserPreferencesAction();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetUserPreferencesQuery() {
  return useQuery(getUserPreferencesQuery());
}

export type UserPreferences = NonNullable<ReturnType<typeof useGetUserPreferencesQuery>["data"]>;

