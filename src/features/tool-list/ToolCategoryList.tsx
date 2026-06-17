import type { RegisteredTool } from "@/tool-runtime/types"

export function groupToolsByCategory(tools: RegisteredTool[]) {
  return tools.reduce<Record<string, RegisteredTool[]>>((groups, tool) => {
    const category = tool.manifest.category
    groups[category] ??= []
    groups[category].push(tool)
    return groups
  }, {})
}
