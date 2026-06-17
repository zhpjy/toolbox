import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "json-format",
  name: "JSON 格式化",
  description: "校验并格式化 JSON，输出缩进后的 JSON 内容",
  category: "JSON / 编码",
  tags: ["JSON", "格式化", "pretty", "校验"],
  aliases: ["json pretty", "json formatter", "格式化 json"],
  inputKind: "json",
  outputKind: "json",
  autoRun: false
} satisfies ToolManifest
