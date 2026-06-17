import { db } from "./db"
import type { ToolboxDataExport } from "./storage-adapter"

export async function exportToolboxData(): Promise<ToolboxDataExport> {
  const [settings, favorites, usageStats, histories, savedCases] = await Promise.all([
    db.settings.toArray(),
    db.favorites.toArray(),
    db.usageStats.toArray(),
    db.histories.toArray(),
    db.savedCases.toArray()
  ])

  return {
    version: "1",
    exportedAt: new Date().toISOString(),
    settings,
    favorites,
    usageStats,
    histories,
    savedCases
  }
}
