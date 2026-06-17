import { db, type SavedCase, type ToolboxDB, type ToolRunHistory } from "./db"
import type { StorageAdapter } from "./storage-adapter"

function createId(prefix: string) {
  const random = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
  return `${prefix}_${random}`
}

export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "undefined"
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`

  const record = value as Record<string, unknown>
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`
}

export function simpleHash(value: unknown): string {
  const input = stableStringify(value)
  let hash = 0
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

export class IndexedDBStorageAdapter implements StorageAdapter {
  constructor(private readonly database: ToolboxDB = db) {}

  async getSetting<T>(key: string): Promise<T | undefined> {
    const setting = await this.database.settings.get(key)
    return setting?.value as T | undefined
  }

  async setSetting<T>(key: string, value: T): Promise<void> {
    await this.database.settings.put({ key, value, updatedAt: Date.now() })
  }

  async addFavorite(toolId: string): Promise<void> {
    await this.database.favorites.put({ toolId, createdAt: Date.now() })
  }

  async removeFavorite(toolId: string): Promise<void> {
    await this.database.favorites.delete(toolId)
  }

  async listFavorites() {
    return this.database.favorites.orderBy("createdAt").reverse().toArray()
  }

  async recordToolRun(params: {
    toolId: string
    input: unknown
    output: unknown
    durationMs?: number
    title?: string
  }): Promise<void> {
    const now = Date.now()
    const inputHash = simpleHash(params.input)
    const outputHash = simpleHash(params.output)

    await this.database.transaction("rw", this.database.histories, this.database.usageStats, async () => {
      const latest = await this.database.histories
        .where("toolId")
        .equals(params.toolId)
        .reverse()
        .sortBy("createdAt")

      const latestSame = latest[0]
      if (
        latestSame &&
        latestSame.inputHash === inputHash &&
        latestSame.outputHash === outputHash &&
        now - latestSame.createdAt < 2000
      ) {
        await this.database.histories.update(latestSame.id, {
          createdAt: now,
          durationMs: params.durationMs,
          title: params.title ?? latestSame.title
        })
      } else {
        await this.database.histories.add({
          id: createId("hist"),
          toolId: params.toolId,
          input: params.input,
          output: params.output,
          createdAt: now,
          durationMs: params.durationMs,
          inputHash,
          outputHash,
          pinned: false,
          title: params.title
        })
      }

      const existing = await this.database.usageStats.get(params.toolId)
      await this.database.usageStats.put({
        toolId: params.toolId,
        runCount: (existing?.runCount ?? 0) + 1,
        lastUsedAt: now
      })

      await this.trimHistories(params.toolId)
    })
  }

  async listHistories(toolId: string, limit = 100): Promise<ToolRunHistory[]> {
    return this.database.histories
      .where("toolId")
      .equals(toolId)
      .reverse()
      .sortBy("createdAt")
      .then((items) => items.slice(0, limit))
  }

  async deleteHistory(id: string): Promise<void> {
    await this.database.histories.delete(id)
  }

  async clearToolHistories(toolId: string): Promise<void> {
    await this.database.histories.where("toolId").equals(toolId).delete()
  }

  async getUsageStats(toolId: string) {
    return this.database.usageStats.get(toolId)
  }

  async listUsageStats() {
    return this.database.usageStats.orderBy("lastUsedAt").reverse().toArray()
  }

  async addSavedCase(params: {
    toolId: string
    name: string
    input: unknown
    output?: unknown
    note?: string
  }): Promise<void> {
    const now = Date.now()
    const item: SavedCase = {
      id: createId("case"),
      toolId: params.toolId,
      name: params.name,
      input: params.input,
      output: params.output,
      note: params.note,
      createdAt: now,
      updatedAt: now
    }
    await this.database.savedCases.add(item)
  }

  async listSavedCases(toolId: string): Promise<SavedCase[]> {
    return this.database.savedCases
      .where("toolId")
      .equals(toolId)
      .reverse()
      .sortBy("updatedAt")
  }

  async deleteSavedCase(id: string): Promise<void> {
    await this.database.savedCases.delete(id)
  }

  private async trimHistories(toolId: string) {
    const items = await this.database.histories
      .where("toolId")
      .equals(toolId)
      .reverse()
      .sortBy("createdAt")

    const removable = items.filter((item) => !item.pinned).slice(100)
    if (removable.length > 0) {
      await this.database.histories.bulkDelete(removable.map((item) => item.id))
    }

    const total = await this.database.histories.orderBy("createdAt").toArray()
    const globalRemovable = total.filter((item) => !item.pinned).slice(0, Math.max(0, total.length - 2000))
    if (globalRemovable.length > 0) {
      await this.database.histories.bulkDelete(globalRemovable.map((item) => item.id))
    }
  }

  close() {
    this.database.close()
  }
}

export const storage = new IndexedDBStorageAdapter()
