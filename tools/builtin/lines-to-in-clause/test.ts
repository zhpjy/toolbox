import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("lines-to-in-clause", () => {
  it("converts two lines", async () => {
    const result = await runTool(tool, "aaa\nbbb")
    expect(result).toMatchObject({ ok: true, output: `'aaa'\n,'bbb'` })
  })

  it("converts three lines", async () => {
    const result = await runTool(tool, "apple\nbanana\ncherry")
    expect(result).toMatchObject({
      ok: true,
      output: `'apple'\n,'banana'\n,'cherry'`
    })
  })

  it("ignores empty lines", async () => {
    const result = await runTool(tool, "x\n\ny\n\nz")
    expect(result).toMatchObject({ ok: true, output: `'x'\n,'y'\n,'z'` })
  })

  it("returns empty string for empty input", async () => {
    const result = await runTool(tool, "")
    expect(result).toMatchObject({ ok: true, output: "" })
  })
})
