import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "ddl-to-select",
  name: "DDL 生成 SELECT",
  description: "根据 Oracle DDL 或带 COMMENT 的字段清单生成 SELECT 语句",
  category: "SQL / Oracle",
  tags: ["SQL", "DDL", "Oracle", "SELECT", "字段", "COMMENT"],
  aliases: ["建表语句转查询", "表结构生成查询", "字段列表", "ddl to select"],
  inputKind: "sql",
  outputKind: "text",
  autoRun: false
} satisfies ToolManifest
