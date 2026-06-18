import type { Tool } from "./types"

const toolIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function validateTool(tool: Tool): string[] {
  const errors: string[] = []
  const manifest = tool.manifest
  const kind = manifest.kind ?? "standard"

  if (!manifest.id || !toolIdPattern.test(manifest.id)) {
    errors.push(`工具 id 必须是 kebab-case: ${manifest.id}`)
  }

  if (!manifest.name.trim()) errors.push(`${manifest.id}: name 不能为空`)
  if (!manifest.description.trim()) errors.push(`${manifest.id}: description 不能为空`)
  if (!manifest.category.trim()) errors.push(`${manifest.id}: category 不能为空`)
  if (!Array.isArray(manifest.tags)) errors.push(`${manifest.id}: tags 必须是数组`)
  if (!["standard", "app"].includes(kind)) errors.push(`${manifest.id}: kind 不合法`)
  if (!["text", "json", "sql", "app"].includes(manifest.inputKind)) errors.push(`${manifest.id}: inputKind 不合法`)
  if (!["text", "json", "diagnostics", "app"].includes(manifest.outputKind)) errors.push(`${manifest.id}: outputKind 不合法`)
  if (typeof tool.run !== "function") errors.push(`${manifest.id}: run 必须是函数`)
  if (kind === "app" && !tool.component) errors.push(`${manifest.id}: app 工具必须提供 component`)

  return errors
}
