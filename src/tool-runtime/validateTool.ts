import type { Tool } from "./types"

const toolIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validateSlotLabels(
  toolId: string,
  fieldName: "inputLabels" | "outputLabels",
  labels: unknown,
  count: number,
  errors: string[]
) {
  if (labels === undefined) return

  if (!Array.isArray(labels) || labels.length === 0 || labels.some((label) => typeof label !== "string" || !label.trim())) {
    errors.push(`${toolId}: ${fieldName} 必须是非空字符串数组`)
    return
  }
  if (labels.length !== count) {
    errors.push(`${toolId}: ${fieldName} 长度必须等于 ${fieldName === "inputLabels" ? "inputCount" : "outputCount"}（${count}），当前为 ${labels.length}`)
  }
}

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
  if (manifest.inputCount !== undefined && (!Number.isInteger(manifest.inputCount) || manifest.inputCount < 1)) {
    errors.push(`${manifest.id}: inputCount 必须是正整数，当前为 ${manifest.inputCount}`)
  }
  if (manifest.outputCount !== undefined && (!Number.isInteger(manifest.outputCount) || manifest.outputCount < 1)) {
    errors.push(`${manifest.id}: outputCount 必须是正整数，当前为 ${manifest.outputCount}`)
  }
  validateSlotLabels(manifest.id, "inputLabels", manifest.inputLabels, manifest.inputCount ?? 1, errors)
  validateSlotLabels(manifest.id, "outputLabels", manifest.outputLabels, manifest.outputCount ?? 1, errors)
  if (typeof tool.run !== "function") errors.push(`${manifest.id}: run 必须是函数`)
  if (kind === "app" && !tool.component) errors.push(`${manifest.id}: app 工具必须提供 component`)

  return errors
}
