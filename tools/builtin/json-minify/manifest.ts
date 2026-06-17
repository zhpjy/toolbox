import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "json-minify",
  name: "JSON 压缩",
  description: "校验 JSON 并输出无多余空白的紧凑 JSON 字符串",
  category: "JSON / 编码",
  tags: ["JSON", "压缩", "minify", "校验"],
  aliases: ["json minify", "json compact", "压缩 json"],
  inputKind: "json",
  outputKind: "text",
  autoRun: false
} satisfies ToolManifest
