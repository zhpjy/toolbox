import "fake-indexeddb/auto"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { ToolboxDB } from "./db"
import { IndexedDBStorageAdapter } from "./indexeddb-storage-adapter"

let database: ToolboxDB
let adapter: IndexedDBStorageAdapter

beforeEach(() => {
  database = new ToolboxDB(`personal-toolbox-test-${crypto.randomUUID()}`)
  adapter = new IndexedDBStorageAdapter(database)
})

afterEach(async () => {
  adapter.close()
  await database.delete()
})

describe("IndexedDBStorageAdapter", () => {
  it("adds and removes favorites", async () => {
    await adapter.addFavorite("camel-to-kebab")
    expect(await adapter.listFavorites()).toHaveLength(1)

    await adapter.removeFavorite("camel-to-kebab")
    expect(await adapter.listFavorites()).toHaveLength(0)
  })

  it("records and lists histories", async () => {
    await adapter.recordToolRun({ toolId: "camel-to-kebab", input: "userName", output: "user-name", durationMs: 1 })
    const histories = await adapter.listHistories("camel-to-kebab")
    expect(histories).toHaveLength(1)
    expect(histories[0]).toMatchObject({ input: "userName", output: "user-name" })
  })

  it("adds and deletes saved cases", async () => {
    await adapter.addSavedCase({ toolId: "json-format", name: "demo", input: "{\"a\":1}", output: { a: 1 } })
    const savedCases = await adapter.listSavedCases("json-format")
    expect(savedCases).toHaveLength(1)

    await adapter.deleteSavedCase(savedCases[0].id)
    expect(await adapter.listSavedCases("json-format")).toHaveLength(0)
  })

  it("reads and writes settings", async () => {
    await adapter.setSetting("theme", "dark")
    await expect(adapter.getSetting<string>("theme")).resolves.toBe("dark")
  })
})
