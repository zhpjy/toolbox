import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("extract-email", () => {
  it("extracts and deduplicates emails", async () => {
    const result = await runTool(tool, "a@test.com b@test.com a@test.com")
    expect(result).toMatchObject({ ok: true, output: "a@test.com\nb@test.com" })
  })
})
