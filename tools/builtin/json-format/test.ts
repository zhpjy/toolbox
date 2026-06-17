import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("json-format", () => {
  it("parses json into formatted output value", async () => {
    const result = await runTool(tool, "{\"name\":\"Alice\",\"age\":18}")
    expect(result).toMatchObject({ ok: true, output: { name: "Alice", age: 18 } })
  })

  it("returns an error for invalid json", async () => {
    const result = await runTool(tool, "{bad")
    expect(result.ok).toBe(false)
  })
})
