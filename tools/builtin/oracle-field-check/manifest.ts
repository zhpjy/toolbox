import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "oracle-field-check",
  name: "Oracle 字段命名检查",
  description: "检查 Oracle 字段名是否符合大写下划线命名，并限制长度不超过 30 个字符",
  category: "SQL / Oracle",
  tags: ["Oracle", "字段", "命名规范", "校验", "snake_case"],
  aliases: ["字段规范检查", "oracle column check", "字段长度检查"],
  inputKind: "sql",
  outputKind: "diagnostics",
  autoRun: false
} satisfies ToolManifest
