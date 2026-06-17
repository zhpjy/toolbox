import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "kebab-to-camel",
  name: "烤串转驼峰命名",
  description: "将 kebab-case 或下划线分隔命名转换为 camelCase",
  category: "文本处理",
  tags: ["命名", "字符串", "前端", "kebab-case", "camelCase"],
  aliases: ["横线转驼峰", "短横线转驼峰", "kebab to camel"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 100
} satisfies ToolManifest
