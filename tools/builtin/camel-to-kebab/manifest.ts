import type { ToolManifest } from "@/tool-runtime/types"

export const manifest = {
  id: "camel-to-kebab",
  name: "驼峰转烤串命名",
  description: "将 camelCase 或 PascalCase 转换为 kebab-case",
  category: "文本处理",
  tags: ["命名", "字符串", "前端", "kebab-case", "camelCase"],
  aliases: ["驼峰转横线", "驼峰转短横线", "camel to kebab"],
  inputKind: "text",
  outputKind: "text",
  autoRun: true,
  debounceMs: 100
} satisfies ToolManifest
