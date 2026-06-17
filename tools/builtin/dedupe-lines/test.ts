import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("dedupe-lines", () => {
  it("deduplicates lines and preserves order", async () => {
    const result = await runTool(tool, "a\nb\na\nc\nb")
    expect(result).toMatchObject({ ok: true, output: "a\nb\nc" })
  })
})
