import type { ToolManifest } from "@/tool-runtime/types"

export type ToolManifestWithCounts = ToolManifest & {
  inputCount?: number
  outputCount?: number
}

export function getInputCount(manifest: ToolManifestWithCounts): number {
  return manifest.inputCount ?? 1
}

export function getOutputCount(manifest: ToolManifestWithCounts): number {
  return manifest.outputCount ?? 1
}

export function renderInputLabel(index: number, total: number, labels?: string[]): string {
  if (total > 1) {
    return labels?.[index] ?? `输入 ${index + 1}`
  }
  return "输入"
}

export function renderOutputLabel(index: number, total: number, labels?: string[]): string {
  if (total > 1) {
    return labels?.[index] ?? `输出 ${index + 1}`
  }
  return "输出"
}