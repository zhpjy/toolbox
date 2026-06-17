import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "remove-empty-lines",
  name: "去空行",
  description: "删除空行和只包含空白字符的行",
  category: "文本处理",
  tags: ["行处理", "空行", "文本"],
  aliases: ["remove empty lines", "删除空行"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 100
} satisfies ToolManifest
