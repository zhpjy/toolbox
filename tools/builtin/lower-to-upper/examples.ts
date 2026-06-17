import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "单词", input: "hello", output: "HELLO" },
  { name: "混合文本", input: "user_id", output: "USER_ID" }
] satisfies ToolExample<string, string>[]
