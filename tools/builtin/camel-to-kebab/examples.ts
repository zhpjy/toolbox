import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "camelCase", input: "userName", output: "user-name" },
  { name: "PascalCase", input: "UserName", output: "user-name" },
  { name: "连续大写", input: "XMLHttpRequest", output: "xml-http-request" }
] satisfies ToolExample<string, string>[]
