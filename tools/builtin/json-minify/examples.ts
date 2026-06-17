import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "对象", input: "{\n  \"name\": \"Alice\",\n  \"age\": 18\n}", output: "{\"name\":\"Alice\",\"age\":18}" },
  { name: "数组", input: "[1, { \"a\": true }]", output: "[1,{\"a\":true}]" }
] satisfies ToolExample<string, string>[]
