import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "trim-lines",
  name: "去除每行首尾空格",
  description: "逐行去除首尾空白，保留原始行顺序",
  category: "文本处理",
  tags: ["行处理", "trim", "空格", "文本"],
  aliases: ["trim lines", "去行首尾空格"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 100
} satisfies ToolManifest
