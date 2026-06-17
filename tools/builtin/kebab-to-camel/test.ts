import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("kebab-to-camel", () => {
  it("converts kebab-case to camelCase", async () => {
    const result = await runTool(tool, "user-name")
    expect(result).toMatchObject({ ok: true, output: "userName" })
  })

  it("converts underscore separated text", async () => {
    const result = await runTool(tool, "user_profile_card")
    expect(result).toMatchObject({ ok: true, output: "userProfileCard" })
  })
})
