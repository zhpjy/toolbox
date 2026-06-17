import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "单词", input: "HELLO", output: "hello" },
  { name: "混合文本", input: "User_ID", output: "user_id" }
] satisfies ToolExample<string, string>[]
