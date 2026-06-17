import { storage } from "@/storage/indexeddb-storage-adapter"
import type { SavedCase } from "@/storage/db"

export async function addSavedCase(params: {
  toolId: string
  name: string
  input: unknown
  output?: unknown
  note?: string
}): Promise<void> {
  await storage.addSavedCase(params)
}

export async function listSavedCases(toolId: string): Promise<SavedCase[]> {
  return storage.listSavedCases(toolId)
}

export async function deleteSavedCase(id: string): Promise<void> {
  await storage.deleteSavedCase(id)
}
