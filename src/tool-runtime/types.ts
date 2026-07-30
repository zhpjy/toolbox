import type { ComponentType, LazyExoticComponent } from "react"

export type ToolInputKind = "text" | "json" | "sql" | "app"

export type ToolOutputKind = "text" | "json" | "diagnostics" | "app"

export type ToolKind = "standard" | "app"

export type ToolManifest = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  aliases?: string[]
  kind?: ToolKind
  inputKind: ToolInputKind
  outputKind: ToolOutputKind
  autoRun?: boolean
  debounceMs?: number
  /** 输入槽位数量，未设置时默认为 1，必须为正整数 */
  inputCount?: number
  /** 输出槽位数量，未设置时默认为 1，必须为正整数 */
  outputCount?: number
  /** 输入槽位的人类可读名称，数量必须与 inputCount 一致 */
  inputLabels?: string[]
  /** 输出槽位的人类可读名称，数量必须与 outputCount 一致 */
  outputLabels?: string[]
  version?: string
  author?: string
  homepage?: string
}

export type ToolExample<Input = unknown, Output = unknown> = {
  name: string
  input: Input
  output?: Output
  description?: string
}

export type ToolRunContext = {
  now: () => Date
}

export type ToolRun<Input = unknown, Output = unknown> = (
  input: Input,
  context: ToolRunContext
) => Output | Promise<Output>

export type Tool<Input = unknown, Output = unknown> = {
  manifest: ToolManifest
  examples?: ToolExample<Input, Output>[]
  run: ToolRun<Input, Output>
  component?: ComponentType<ToolAppComponentProps> | LazyExoticComponent<ComponentType<ToolAppComponentProps>>
}

export type ToolAppComponentProps = {
  tool: RegisteredTool
  activeExample?: {
    name: string
    input: unknown
    output?: unknown
    nonce: number
  }
}

export type DiagnosticSeverity = "error" | "warning" | "info"

export type ToolDiagnostic = {
  severity: DiagnosticSeverity
  message: string
  line?: number
  column?: number
  fieldName?: string
  ruleId?: string
}

export type RegisteredTool = Tool<any, unknown>
