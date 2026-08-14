import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type ViewMode = "grid" | "list" | "compact";
export type SortOption = "newest" | "oldest" | "most-visited" | "name";

interface UserPreferencesState {
  viewMode: ViewMode;
  sortBy: SortOption;
  isHydrated: boolean;
  actions: {
    setViewMode: (mode: ViewMode) => void;
    setSortBy: (sort: SortOption) => void;
    setPreferences: (prefs: { viewMode?: ViewMode; sortBy?: SortOption }) => void;
    setHydrated: (hydrated: boolean) => void;
  };
}

export const useUserPreferencesStore = create<UserPreferencesState>()(
  devtools(
    persist(
      immer((set) => ({
        viewMode: "grid",
        sortBy: "newest",
        isHydrated: false,
        actions: {
          setViewMode: (mode) =>
            set((state) => {
              state.viewMode = mode;
            }),
          setSortBy: (sort) =>
            set((state) => {
              state.sortBy = sort;
            }),
          setPreferences: (prefs) =>
            set((state) => {
              if (prefs.viewMode) state.viewMode = prefs.viewMode;
              if (prefs.sortBy) state.sortBy = prefs.sortBy;
            }),
          setHydrated: (hydrated) =>
            set((state) => {
              state.isHydrated = hydrated;
            }),
        },
      })),
      {
        name: "user-preferences-storage",
        partialize: (state) => ({
          viewMode: state.viewMode,
          sortBy: state.sortBy,
        }),
      }
    ),
    { name: "user-preferences-store" }
  )
);

// Selector hooks for high performance & clean code
export const useViewMode = () => useUserPreferencesStore((state) => state.viewMode);
export const useSortBy = () => useUserPreferencesStore((state) => state.sortBy);
export const useIsPreferencesHydrated = () =>
  useUserPreferencesStore((state) => state.isHydrated);
export const usePreferencesActions = () =>
  useUserPreferencesStore((state) => state.actions);
