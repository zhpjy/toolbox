import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import type { Tool, ToolDiagnostic } from "@/tool-runtime/types"
import { tool } from "./index"

const oracleFieldCheckTool: Tool<string, ToolDiagnostic[]> = tool

describe("oracle-field-check", () => {
  it("accepts uppercase snake case fields", async () => {
    const result = await runTool(oracleFieldCheckTool, "CREATE TABLE T_USER (\n USER_ID NUMBER,\n USER_NAME VARCHAR2(100)\n);")
    expect(result).toMatchObject({ ok: true, output: [] })
  })

  it("reports lowercase and too long fields", async () => {
    const result = await runTool(oracleFieldCheckTool, "user_name VARCHAR2(10)\nVERY_LONG_FIELD_NAME_OVER_30_CHARS NUMBER")
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.output.map((item) => item.ruleId)).toEqual(["upper-snake-case", "max-30-chars"])
    }
  })
})
