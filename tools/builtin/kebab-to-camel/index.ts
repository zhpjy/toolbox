import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

export const tool = {
  manifest,
  examples,
  run(input: string) {
    return input
      .trim()
      .toLowerCase()
      .replace(/[-_\s]+([a-z0-9])/g, (_, char: string) => char.toUpperCase())
  }
} satisfies Tool<string, string>
