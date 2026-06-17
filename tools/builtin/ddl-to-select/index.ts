import type { Tool } from "@/tool-runtime/types"
import {
  extractCommentedColumns,
  extractOracleColumns,
  extractOracleTableName,
  quoteSqlAlias
} from "@/tool-runtime/sql/oracleParser"
import { examples } from "./examples"
import { manifest } from "./manifest"

function generateCommentSelect(input: string) {
  const columns = extractCommentedColumns(input)
  if (columns.length === 0) return undefined

  const tableName = extractOracleTableName(input) ?? "table_name"
  const columnSql = columns
    .map((column, index) => {
      const prefix = index === 0 ? "  " : "  ,"
      return `${prefix}${column.rawName} AS ${quoteSqlAlias(column.comment ?? column.name)}`
    })
    .join("\n")

  return [
    "SELECT",
    columnSql,
    `FROM ${tableName}`,
    "WHERE ds >= to_char(date'${dsStart}', 'yyyymmdd')",
    "AND ds <= to_char(date'${dsEnd}', 'yyyymmdd')"
  ].join("\n")
}

function generatePlainSelect(input: string) {
  const columns = extractOracleColumns(input)
  if (columns.length === 0) return ""

  const tableName = extractOracleTableName(input) ?? "table_name"
  const columnSql = columns
    .map((column, index) => {
      const suffix = index === columns.length - 1 ? "" : ","
      return `  ${column.rawName}${suffix}`
    })
    .join("\n")

  return ["SELECT", columnSql, `FROM ${tableName};`].join("\n")
}

export const tool = {
  manifest,
  examples,
  run(input: string) {
    return generateCommentSelect(input) ?? generatePlainSelect(input)
  }
} satisfies Tool<string, string>
