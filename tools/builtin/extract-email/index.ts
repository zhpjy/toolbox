import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    const emails = input.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []
    return Array.from(new Set(emails)).join("\n")
  }
} satisfies Tool<string, string>
