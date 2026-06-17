import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("upper-to-lower", () => {
  it("converts text to lowercase", async () => {
    const result = await runTool(tool, "ABC User_ID")
    expect(result).toMatchObject({ ok: true, output: "abc user_id" })
  })
})
