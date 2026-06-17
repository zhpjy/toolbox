import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "dedupe-lines",
  name: "行去重",
  description: "按行去重，保留每个唯一行的首次出现位置",
  category: "文本处理",
  tags: ["行处理", "去重", "文本"],
  aliases: ["unique lines", "dedupe lines", "删除重复行"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 120
} satisfies ToolManifest
