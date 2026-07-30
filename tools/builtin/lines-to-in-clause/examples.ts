import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  {
    name: "基础用法",
    input: "aaa\nbbb",
    output: `'aaa'
,'bbb'`
  },
  {
    name: "多个值",
    input: "apple\nbanana\ncherry",
    output: `'apple'
,'banana'
,'cherry'`
  },
  {
    name: "空行会被忽略",
    input: "x\n\ny\n\nz",
    output: `'x'
,'y'
,'z'`
  }
] satisfies ToolExample<string, string>[]
