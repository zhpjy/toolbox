import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "基础去重", input: "a\nb\na", output: "a\nb" },
  { name: "保留空行一次", input: "a\n\n\na", output: "a\n" }
] satisfies ToolExample<string, string>[]
