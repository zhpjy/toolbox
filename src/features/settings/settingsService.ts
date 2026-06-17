import { storage } from "@/storage/indexeddb-storage-adapter"

export async function getSetting<T>(key: string): Promise<T | undefined> {
  return storage.getSetting<T>(key)
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  await storage.setSetting(key, value)
}
