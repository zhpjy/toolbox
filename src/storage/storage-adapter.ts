import type {
  AppSetting,
  SavedCase,
  ToolFavorite,
  ToolRunHistory,
  ToolUsageStats
} from "./db"

export interface StorageAdapter {
  getSetting<T>(key: string): Promise<T | undefined>
  setSetting<T>(key: string, value: T): Promise<void>

  addFavorite(toolId: string): Promise<void>
  removeFavorite(toolId: string): Promise<void>
  listFavorites(): Promise<ToolFavorite[]>

  recordToolRun(params: {
    toolId: string
    input: unknown
    output: unknown
    durationMs?: number
    title?: string
  }): Promise<void>

  listHistories(toolId: string, limit?: number): Promise<ToolRunHistory[]>
  deleteHistory(id: string): Promise<void>
  clearToolHistories(toolId: string): Promise<void>

  getUsageStats(toolId: string): Promise<ToolUsageStats | undefined>
  listUsageStats(): Promise<ToolUsageStats[]>

  addSavedCase(params: {
    toolId: string
    name: string
    input: unknown
    output?: unknown
    note?: string
  }): Promise<void>

  listSavedCases(toolId: string): Promise<SavedCase[]>
  deleteSavedCase(id: string): Promise<void>
}

export type ToolboxDataExport = {
  version: string
  exportedAt: string
  settings: AppSetting[]
  favorites: ToolFavorite[]
  usageStats: ToolUsageStats[]
  histories: ToolRunHistory[]
  savedCases: SavedCase[]
}
