import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  { name: "kebab-case", input: "user-name", output: "userName" },
  { name: "多段", input: "user-profile-card", output: "userProfileCard" },
  { name: "下划线", input: "user_name", output: "userName" }
] satisfies ToolExample<string, string>[]
