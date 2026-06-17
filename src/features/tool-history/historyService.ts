import { storage } from "@/storage/indexeddb-storage-adapter"
import type { ToolRunHistory } from "@/storage/db"

export async function recordHistory(params: {
  toolId: string
  input: unknown
  output: unknown
  durationMs?: number
  title?: string
}): Promise<void> {
  await storage.recordToolRun(params)
}

export async function listHistories(toolId: string, limit = 20): Promise<ToolRunHistory[]> {
  return storage.listHistories(toolId, limit)
}

export async function deleteHistory(id: string): Promise<void> {
  await storage.deleteHistory(id)
}

export async function clearHistories(toolId: string): Promise<void> {
  await storage.clearToolHistories(toolId)
}
