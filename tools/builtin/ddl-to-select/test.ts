import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("ddl-to-select", () => {
  it("generates select from Oracle DDL", async () => {
    const input = "CREATE TABLE T_USER (\n  USER_ID NUMBER,\n  USER_NAME VARCHAR2(100),\n  AMOUNT NUMBER(18, 2),\n  CONSTRAINT PK_T_USER PRIMARY KEY (USER_ID)\n);"
    const result = await runTool(tool, input)
    expect(result).toMatchObject({
      ok: true,
      output: "SELECT\n  USER_ID,\n  USER_NAME,\n  AMOUNT\nFROM T_USER;"
    })
  })

  it("generates comment aliases from commented column list", async () => {
    const input = "--     month STRING COMMENT 'month'\n--     ,stat_date STRING COMMENT '日期'\n--     -- 指标分组\n--     ,area_name STRING COMMENT '大区'"
    const result = await runTool(tool, input)
    expect(result).toMatchObject({
      ok: true,
      output: "SELECT\n  month AS \"month\"\n  ,stat_date AS \"日期\"\n  ,area_name AS \"大区\"\nFROM table_name\nWHERE ds >= to_char(date'${dsStart}', 'yyyymmdd')\nAND ds <= to_char(date'${dsEnd}', 'yyyymmdd')"
    })
  })
})
