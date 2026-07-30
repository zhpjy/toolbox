import type { ToolExample } from "@/tool-runtime/types"

export const examples = [
  {
    name: "公式代入与计算结果：基础四则运算",
    input: ["a+b+c/d*e", "a:1 b:2 c:3 d:4 e:5"],
    output: ["1+2+3/4*5", "6.75"]
  },
  {
    name: "公式代入与计算结果：含括号的表达式",
    input: ["(a+b)*(c-d)/e", "a:10 b:5 c:8 d:3 e:2"],
    output: ["(10+5)*(8-3)/2", "37.5"]
  },
  {
    name: "公式代入与计算结果：无变量常数计算",
    input: ["(1+2)*3-4/2", ""],
    output: ["(1+2)*3-4/2", "7"]
  }
] satisfies ToolExample<[string, string], [string, string]>[]
