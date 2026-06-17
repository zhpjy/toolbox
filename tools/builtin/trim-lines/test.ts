import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("trim-lines", () => {
  it("trims each line", async () => {
    const result = await runTool(tool, "  a  \n b")
    expect(result).toMatchObject({ ok: true, output: "a\nb" })
  })
})
