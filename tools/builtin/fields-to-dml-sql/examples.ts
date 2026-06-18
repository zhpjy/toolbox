import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  {
    name: "账单字段",
    input:
      "parent_bill_code\tnation_code\tbill_codes\tbcreate_srec_cnt_1bcsrd\trec_on_time_cnt_1bcsrd\tsign_cnt\treturn_print_cnt\tfirst_attempt_disp_cnt\tdisp_on_time_cnt",
    output: `CREATE TABLE IF NOT EXISTS tmp_table
(
  parent_bill_code  STRING  COMMENT  ''
  ,bill_codes  STRING  COMMENT  ''
  ,bcreate_srec_cnt_1bcsrd  BIGINT  COMMENT  ''
  ,rec_on_time_cnt_1bcsrd  BIGINT  COMMENT  ''
  ,sign_cnt  BIGINT  COMMENT  ''
  ,return_print_cnt  BIGINT  COMMENT  ''
  ,first_attempt_disp_cnt  BIGINT  COMMENT  ''
  ,disp_on_time_cnt  BIGINT  COMMENT  ''
)COMMENT ''
PARTITIONED BY
(
  ds  STRING  COMMENT ''
  ,nation_code  STRING  COMMENT ''
)
LIFECYCLE 700;`
  },
  {
    name: "日期时间字段",
    input: "user_id created_time updated_date order_cnt nation_code",
    output: `CREATE TABLE IF NOT EXISTS tmp_table
(
  user_id  STRING  COMMENT  ''
  ,created_time  DATETIME  COMMENT  ''
  ,updated_date  DATETIME  COMMENT  ''
  ,order_cnt  BIGINT  COMMENT  ''
)COMMENT ''
PARTITIONED BY
(
  ds  STRING  COMMENT ''
  ,nation_code  STRING  COMMENT ''
)
LIFECYCLE 700;`
  }
] satisfies ToolExample<string, string>[]
