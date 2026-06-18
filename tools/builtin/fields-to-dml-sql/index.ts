import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

function inferType(field: string) {
  if (field.endsWith("date") || field.endsWith("time")) {
    return "DATETIME"
  }

  if (field.includes("_cnt_") || field.includes("_count_") || field.endsWith("_cnt")) {
    return "BIGINT"
  }

  return "STRING"
}

export const tool = {
  manifest,
  examples,
  run(input: string) {
    const titles = input.split(/[\s,]+/)
    let colSql = ""

    for (const rawTitle of titles) {
      const title = rawTitle.trim()
      if (!title || title === "nation_code") {
        continue
      }

      colSql += `  ,${title}  ${inferType(title)}  COMMENT  ''\n`
    }

    colSql = colSql.trim().replace(/^,/, "")

    return `CREATE TABLE IF NOT EXISTS tmp_table
(
  ${colSql}
)COMMENT ''
PARTITIONED BY
(
  ds  STRING  COMMENT ''
  ,nation_code  STRING  COMMENT ''
)
LIFECYCLE 700;`
  }
} satisfies Tool<string, string>
