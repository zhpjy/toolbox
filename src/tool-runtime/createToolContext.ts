import type { ToolRunContext } from "./types"

export function createToolContext(): ToolRunContext {
  return {
    now: () => new Date()
  }
}
