import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "sort-lines",
  name: "行排序",
  description: "对输入文本逐行按字典序排序",
  category: "文本处理",
  tags: ["行处理", "排序", "文本", "sort"],
  aliases: ["sort lines", "文本排序"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 120
} satisfies ToolManifest
