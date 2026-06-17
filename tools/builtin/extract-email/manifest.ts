import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "extract-email",
  name: "提取邮箱",
  description: "从文本中提取邮箱地址，默认去重并保留首次出现顺序",
  category: "提取类",
  tags: ["邮箱", "Email", "正则", "文本提取"],
  aliases: ["email extract", "提取 email", "邮件地址"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 150
} satisfies ToolManifest
