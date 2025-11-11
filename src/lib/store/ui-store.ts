import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * UI Store for global UI state management
 * This store uses Zustand for state management with persistence
 */

interface UiState {
  // Sidebar state
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Language preference (managed separately from next-intl for UI state)
  preferredLocale: "pt-BR" | "en-US";
  setPreferredLocale: (locale: "pt-BR" | "en-US") => void;

  // Upload modal state
  uploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;

  // Current view filter
  taskFilter: "all" | "pending" | "completed";
  setTaskFilter: (filter: "all" | "pending" | "completed") => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),

      // Language
      preferredLocale: "pt-BR",
      setPreferredLocale: (locale: "pt-BR" | "en-US") => set({ preferredLocale: locale }),

      // Upload modal
      uploadModalOpen: false,
      setUploadModalOpen: (open: boolean) => set({ uploadModalOpen: open }),

      // Task filter
      taskFilter: "all",
      setTaskFilter: (filter: "all" | "pending" | "completed") => set({ taskFilter: filter }),
    }),
    {
      name: "optsolv-ui-storage",
      // Only persist certain fields
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        preferredLocale: state.preferredLocale,
        taskFilter: state.taskFilter,
      }),
    }
  )
);
