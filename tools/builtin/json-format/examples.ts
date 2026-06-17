import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "对象", input: "{\"name\":\"Alice\",\"age\":18}", output: { name: "Alice", age: 18 } },
  { name: "数组", input: "[1,{\"a\":true}]", output: [1, { a: true }] }
] satisfies ToolExample<string, unknown>[]
