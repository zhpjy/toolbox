export type ToolInputKind = "text" | "json" | "sql"

export type ToolOutputKind = "text" | "json" | "diagnostics"

export type ToolManifest = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  aliases?: string[]
  inputKind: ToolInputKind
  outputKind: ToolOutputKind
  autoRun?: boolean
  debounceMs?: number
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

export type RegisteredTool = Tool<string, unknown>
