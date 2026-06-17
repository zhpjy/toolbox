import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("camel-to-kebab", () => {
  it("converts camelCase to kebab-case", async () => {
    const result = await runTool(tool, "userName")
    expect(result).toMatchObject({ ok: true, output: "user-name" })
  })

  it("handles consecutive uppercase segments", async () => {
    const result = await runTool(tool, "XMLHttpRequest")
    expect(result).toMatchObject({ ok: true, output: "xml-http-request" })
  })
})
