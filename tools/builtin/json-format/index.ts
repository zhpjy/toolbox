import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    if (!input.trim()) return null
    return JSON.parse(input)
  }
} satisfies Tool<string, unknown>
