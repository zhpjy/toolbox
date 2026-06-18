import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "excel-compare",
  name: "Excel Compare",
  description: "对比 Excel Sheet，支持上传、切换 Sheet、编辑、粘贴与高亮 Diff",
  category: "Excel / 表格",
  tags: ["Excel", "XLSX", "Diff", "表格", "Compare"],
  aliases: ["excel diff", "xlsx compare", "表格对比", "sheet diff"],
  kind: "app",
  inputKind: "app",
  outputKind: "app",
  autoRun: false
} satisfies ToolManifest
