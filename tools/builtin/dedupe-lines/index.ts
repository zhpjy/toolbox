import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    const seen = new Set<string>()
    const lines = input.split(/\r?\n/)
    return lines.filter((line) => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    }).join("\n")
  }
} satisfies Tool<string, string>
