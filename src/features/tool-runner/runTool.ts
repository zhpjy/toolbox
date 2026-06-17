import { createToolContext } from "@/tool-runtime/createToolContext"
import type { Tool } from "@/tool-runtime/types"

export type ToolRunResult<Output = unknown> = {
  ok: true
  output: Output
  durationMs: number
} | {
  ok: false
  error: string
  durationMs: number
}

export async function runTool<Input = unknown, Output = unknown>(
  tool: Tool<Input, Output>,
  input: Input
): Promise<ToolRunResult<Output>> {
  const startedAt = performance.now()

  try {
    const output = await tool.run(input, createToolContext())
    return {
      ok: true,
      output,
      durationMs: Math.round(performance.now() - startedAt)
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      durationMs: Math.round(performance.now() - startedAt)
    }
  }
}
