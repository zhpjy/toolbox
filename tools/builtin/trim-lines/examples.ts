import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "两行", input: "  a  \n b", output: "a\nb" },
  { name: "保留空行", input: "  a\n   \nb ", output: "a\n\nb" }
] satisfies ToolExample<string, string>[]
