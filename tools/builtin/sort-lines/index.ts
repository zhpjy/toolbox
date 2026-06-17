import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    return input.split(/\r?\n/).sort((a, b) => a.localeCompare(b, "zh-CN")).join("\n")
  }
} satisfies Tool<string, string>
