import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "删除空行", input: "a\n\n b\n   \nc", output: "a\n b\nc" },
  { name: "全空", input: "\n   \n", output: "" }
] satisfies ToolExample<string, string>[]
