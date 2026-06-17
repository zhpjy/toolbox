import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("json-minify", () => {
  it("minifies json", async () => {
    const result = await runTool(tool, "{\n  \"name\": \"Alice\",\n  \"age\": 18\n}")
    expect(result).toMatchObject({ ok: true, output: "{\"name\":\"Alice\",\"age\":18}" })
  })
})
