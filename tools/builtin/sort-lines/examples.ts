import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "基础排序", input: "c\na\nb", output: "a\nb\nc" },
  { name: "数字文本", input: "2\n10\n1", output: "1\n10\n2" }
] satisfies ToolExample<string, string>[]
