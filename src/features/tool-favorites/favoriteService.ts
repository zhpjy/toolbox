import { storage } from "@/storage/indexeddb-storage-adapter"

export async function listFavoriteIds(): Promise<string[]> {
  const favorites = await storage.listFavorites()
  return favorites.map((item) => item.toolId)
}

export async function toggleFavorite(toolId: string, favorite: boolean): Promise<void> {
  if (favorite) {
    await storage.addFavorite(toolId)
  } else {
    await storage.removeFavorite(toolId)
  }
}
