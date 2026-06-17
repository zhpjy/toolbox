import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("lower-to-upper", () => {
  it("converts text to uppercase", async () => {
    const result = await runTool(tool, "abc user_id")
    expect(result).toMatchObject({ ok: true, output: "ABC USER_ID" })
  })
})
