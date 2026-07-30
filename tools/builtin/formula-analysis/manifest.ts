import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "formula-analysis",
  name: "公式计算",
  description: "代入变量计算四则运算公式，支持括号、+ - * /、数字和变量名",
  category: "数学计算",
  tags: ["公式", "计算", "四则运算", "变量代入"],
  aliases: ["formula", "公式计算", "表达式计算"],
  inputKind: "text",
  outputKind: "text",
  inputCount: 2,
  outputCount: 2,
  inputLabels: ["公式", "变量"],
  outputLabels: ["公式代入", "计算结果"],
  autoRun: true,
  debounceMs: 300
} satisfies ToolManifest
