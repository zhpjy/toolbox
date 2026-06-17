import type { ToolDiagnostic, ToolExample } from "@/tool-runtime/types"

export const examples = [
  {
    name: "合法字段",
    input: "CREATE TABLE T_USER (\n  USER_ID NUMBER,\n  USER_NAME VARCHAR2(100)\n);",
    output: []
  },
  {
    name: "非法字段",
    input: "user-name VARCHAR2(10)",
    output: [
      {
        severity: "error",
        fieldName: "user-name",
        line: 1,
        message: "字段名应使用大写下划线命名，仅包含 A-Z、0-9、_，且不能以数字开头。",
        ruleId: "upper-snake-case"
      }
    ]
  }
] satisfies ToolExample<string, ToolDiagnostic[]>[]
