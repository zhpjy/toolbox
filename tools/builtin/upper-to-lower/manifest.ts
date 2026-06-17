import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "upper-to-lower",
  name: "大写转小写",
  description: "将输入文本全部转换为小写",
  category: "文本处理",
  tags: ["大小写", "字符串", "lowercase"],
  aliases: ["转小写", "lower case", "to lower"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 80
} satisfies ToolManifest
