import { describe, expect, it } from "vitest"
import { tools } from "@/generated/tool-registry"
import { toolSearchIndex } from "@/generated/tool-search-index"
import { searchTools } from "./searchTools"

function search(query: string) {
  return searchTools({ tools, searchIndex: toolSearchIndex, query }).map((tool) => tool.manifest.id)
}

describe("searchTools", () => {
  it("matches name", () => {
    expect(search("邮箱")[0]).toBe("extract-email")
  })

  it("matches alias", () => {
    expect(search("建表语句")[0]).toBe("ddl-to-select")
  })

  it("matches tag", () => {
    expect(search("JSON")).toContain("json-format")
  })

  it("matches description", () => {
    expect(search("IndexedDB 不存在")).toEqual([])
    expect(search("大写下划线")[0]).toBe("oracle-field-check")
  })

  it("returns no result for unknown query", () => {
    expect(search("__not_found__")).toEqual([])
  })
})
