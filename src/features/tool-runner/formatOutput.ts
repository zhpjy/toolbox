import type { ToolOutputKind } from "@/tool-runtime/types"

export function formatToolOutput(output: unknown, kind: ToolOutputKind): string {
  if (output === undefined) return ""
  if (output === null) return kind === "json" ? "null" : ""
  if (typeof output === "string") return output
  return JSON.stringify(output, null, 2)
}

export function previewValue(value: unknown, maxLength = 120): string {
  const text = typeof value === "string" ? value : JSON.stringify(value)
  if (!text) return "空"
  const singleLine = text.replace(/\s+/g, " ").trim()
  return singleLine.length > maxLength ? `${singleLine.slice(0, maxLength)}...` : singleLine
}
