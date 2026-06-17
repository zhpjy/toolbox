import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("sort-lines", () => {
  it("sorts lines", async () => {
    const result = await runTool(tool, "c\na\nb")
    expect(result).toMatchObject({ ok: true, output: "a\nb\nc" })
  })
})
