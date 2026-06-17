import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "lower-to-upper",
  name: "小写转大写",
  description: "将输入文本全部转换为大写",
  category: "文本处理",
  tags: ["大小写", "字符串", "uppercase"],
  aliases: ["转大写", "upper case", "to upper"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 80
} satisfies ToolManifest
