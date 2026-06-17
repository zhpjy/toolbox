import { create } from "zustand"
import type { ToolUsageStats } from "@/storage/db"

type AppStore = {
  selectedToolId?: string
  searchQuery: string
  favoriteIds: string[]
  usageStats: Record<string, ToolUsageStats>
  setSelectedToolId: (toolId: string) => void
  setSearchQuery: (query: string) => void
  setFavoriteIds: (ids: string[]) => void
  setUsageStats: (stats: ToolUsageStats[]) => void
}

export const useAppStore = create<AppStore>((set) => ({
  selectedToolId: typeof localStorage === "undefined" ? undefined : localStorage.getItem("selectedToolId") ?? undefined,
  searchQuery: "",
  favoriteIds: [],
  usageStats: {},
  setSelectedToolId: (toolId) => {
    localStorage.setItem("selectedToolId", toolId)
    set({ selectedToolId: toolId })
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFavoriteIds: (ids) => set({ favoriteIds: ids }),
  setUsageStats: (stats) => {
    set({ usageStats: Object.fromEntries(stats.map((item) => [item.toolId, item])) })
  }
}))
