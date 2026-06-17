import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    return input.split(/\r?\n/).filter((line) => line.trim().length > 0).join("\n")
  }
} satisfies Tool<string, string>
