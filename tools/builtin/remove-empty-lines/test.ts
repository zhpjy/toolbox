import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("remove-empty-lines", () => {
  it("removes blank lines", async () => {
    const result = await runTool(tool, "a\n\n b\n   \nc")
    expect(result).toMatchObject({ ok: true, output: "a\n b\nc" })
  })
})
