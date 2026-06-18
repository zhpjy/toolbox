import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "fields-to-dml-sql",
  name: "字段转 DML 语句",
  description: "根据字段名自动推断类型并生成建表 SQL",
  category: "SQL",
  tags: ["SQL", "DML", "DDL", "建表", "字段"],
  aliases: ["字段转SQL", "字段转建表语句", "fields to sql"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 80
} satisfies ToolManifest
