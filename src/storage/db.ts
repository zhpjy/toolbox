import Dexie, { type Table } from "dexie"

export type AppSetting = {
  key: string
  value: unknown
  updatedAt: number
}

export type ToolFavorite = {
  toolId: string
  createdAt: number
}

export type ToolUsageStats = {
  toolId: string
  runCount: number
  lastUsedAt: number
}

export type ToolRunHistory = {
  id: string
  toolId: string
  input: unknown
  output: unknown
  createdAt: number
  durationMs?: number
  inputHash?: string
  outputHash?: string
  pinned?: boolean
  title?: string
}

export type SavedCase = {
  id: string
  toolId: string
  name: string
  input: unknown
  output?: unknown
  note?: string
  createdAt: number
  updatedAt: number
}

export class ToolboxDB extends Dexie {
  settings!: Table<AppSetting, string>
  favorites!: Table<ToolFavorite, string>
  usageStats!: Table<ToolUsageStats, string>
  histories!: Table<ToolRunHistory, string>
  savedCases!: Table<SavedCase, string>

  constructor(name = "personal-toolbox") {
    super(name)

    this.version(1).stores({
      settings: "key",
      favorites: "toolId, createdAt",
      usageStats: "toolId, lastUsedAt, runCount",
      histories: "id, toolId, createdAt, pinned, [toolId+createdAt]",
      savedCases: "id, toolId, name, createdAt, updatedAt, [toolId+updatedAt]"
    })
  }
}

export const db = new ToolboxDB()
