import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

describe("fields-to-dml-sql", () => {
  it("generates create table sql from fields", async () => {
    const result = await runTool(
      tool,
      "parent_bill_code\tnation_code\tbill_codes\tbcreate_srec_cnt_1bcsrd\trec_on_time_cnt_1bcsrd\tsign_cnt"
    )

    expect(result).toMatchObject({
      ok: true,
      output: `CREATE TABLE IF NOT EXISTS tmp_table
(
  parent_bill_code  STRING  COMMENT  ''
  ,bill_codes  STRING  COMMENT  ''
  ,bcreate_srec_cnt_1bcsrd  BIGINT  COMMENT  ''
  ,rec_on_time_cnt_1bcsrd  BIGINT  COMMENT  ''
  ,sign_cnt  BIGINT  COMMENT  ''
)COMMENT ''
PARTITIONED BY
(
  ds  STRING  COMMENT ''
  ,nation_code  STRING  COMMENT ''
)
LIFECYCLE 700;`
    })
  })

  it("infers datetime and bigint types", async () => {
    const result = await runTool(tool, "created_time updated_date total_count_value order_cnt")

    expect(result).toMatchObject({
      ok: true,
      output: `CREATE TABLE IF NOT EXISTS tmp_table
(
  created_time  DATETIME  COMMENT  ''
  ,updated_date  DATETIME  COMMENT  ''
  ,total_count_value  BIGINT  COMMENT  ''
  ,order_cnt  BIGINT  COMMENT  ''
)COMMENT ''
PARTITIONED BY
(
  ds  STRING  COMMENT ''
  ,nation_code  STRING  COMMENT ''
)
LIFECYCLE 700;`
    })
  })
})
