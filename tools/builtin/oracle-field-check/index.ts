import type { Tool, ToolDiagnostic } from "@/tool-runtime/types"
import { extractOracleColumns } from "@/tool-runtime/sql/oracleParser"
import { examples } from "./examples"
import { manifest } from "./manifest"

const upperSnakeCasePattern = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$/

export const tool = {
  manifest,
  examples,
  run(input: string) {
    const columns = extractOracleColumns(input)
    const diagnostics: ToolDiagnostic[] = []

    if (columns.length === 0 && input.trim()) {
      diagnostics.push({
        severity: "warning",
        message: "没有识别到字段。请粘贴 CREATE TABLE DDL 或字段清单。",
        ruleId: "no-column-detected"
      })
      return diagnostics
    }

    for (const column of columns) {
      if (column.name.length > 30) {
        diagnostics.push({
          severity: "error",
          fieldName: column.name,
          line: column.line,
          message: "字段名长度不能超过 30 个字符。",
          ruleId: "max-30-chars"
        })
      }

      if (!upperSnakeCasePattern.test(column.name)) {
        diagnostics.push({
          severity: "error",
          fieldName: column.name,
          line: column.line,
          message: "字段名应使用大写下划线命名，仅包含 A-Z、0-9、_，且不能以数字开头。",
          ruleId: "upper-snake-case"
        })
      }
    }

    return diagnostics
  }
} satisfies Tool<string, ToolDiagnostic[]>
