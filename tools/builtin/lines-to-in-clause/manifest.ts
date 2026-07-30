import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "lines-to-in-clause",
  name: "行转 SQL IN 子句",
  description: "按换行分隔多行文本，每行转成 SQL IN 子句中的引用值",
  category: "SQL",
  tags: ["SQL", "IN", "拼接", "行处理"],
  aliases: ["in clause", "行转IN", "sql in", "lines to in"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 80
} satisfies ToolManifest
