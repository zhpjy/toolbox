import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    const lines = input.split(/\r?\n/).filter(line => line.trim() !== "")
    if (lines.length === 0) return ""
    return lines.map((line, i) => {
      const quoted = `'${line.trim()}'`
      return i === 0 ? quoted : `,${quoted}`
    }).join("\n")
  }
} satisfies Tool<string, string>
