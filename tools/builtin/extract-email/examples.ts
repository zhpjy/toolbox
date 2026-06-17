import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "单个邮箱", input: "请联系 test@example.com", output: "test@example.com" },
  { name: "多个邮箱", input: "a@test.com, b@test.com, a@test.com", output: "a@test.com\nb@test.com" }
] satisfies ToolExample<string, string>[]
