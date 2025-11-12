import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI Store for global UI state management
 * This store uses Zustand for state management with persistence
 */

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  preferredLocale: "pt-BR" | "en-US";
  setPreferredLocale: (locale: "pt-BR" | "en-US") => void;

  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;

  taskFilter: "all" | "pending" | "completed";
  setTaskFilter: (filter: "all" | "pending" | "completed") => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      preferredLocale: "pt-BR",
      setPreferredLocale: (locale: "pt-BR" | "en-US") => set({ preferredLocale: locale }),

      uploadModalOpen: false,
      setUploadModalOpen: (open: boolean) => set({ uploadModalOpen: open }),

      taskFilter: "all",
      setTaskFilter: (filter: "all" | "pending" | "completed") => set({ taskFilter: filter }),
    }),
    {
      name: "optsolv-ui-storage",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        preferredLocale: state.preferredLocale,
        taskFilter: state.taskFilter,
      }),
    }
  )
);
