import { describe, expect, it } from "vitest"
import { runTool } from "@/features/tool-runner/runTool"
import { tool } from "./index"

const run = (formula: string, variables = "") => runTool(tool, [formula, variables])

describe("formula-analysis", () => {
  it("用户示例：返回代入公式和计算结果两个输出", async () => {
    const result = await run("a+b+c/d*e", "a:1 b:2 c:3 d:4 e:5")
    expect(result).toMatchObject({ ok: true, output: ["1+2+3/4*5", "6.75"] })
  })

  it("支持等号赋值", async () => {
    const result = await run("a+b", "a=3 b=4")
    expect(result).toMatchObject({ ok: true, output: ["3+4", "7"] })
  })

  it("乘除优先于加减", async () => {
    const result = await run("2+3*4")
    expect(result).toMatchObject({ ok: true, output: ["2+3*4", "14"] })
  })

  it("括号提升优先级并支持嵌套", async () => {
    const result = await run("((1+2)*3-4)/2")
    expect(result).toMatchObject({ ok: true, output: ["((1+2)*3-4)/2", "2.5"] })
  })

  it("支持小数和一元负号", async () => {
    const result = await run("-(a+b)", "a:0.1 b:0.2")
    expect(result).toMatchObject({ ok: true, output: ["-(0.1+0.2)", "-0.3"] })
  })

  it("变量替换不误伤名称相近的变量", async () => {
    const result = await run("a+ab", "a:1 ab:2")
    expect(result).toMatchObject({ ok: true, output: ["1+2", "3"] })
  })

  it("错误：公式为空", async () => {
    const result = await run(" ")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("公式不能为空") })
  })

  it("错误：变量格式错误", async () => {
    const result = await run("a+b", "abad")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("变量格式错误") })
  })

  it("错误：变量值不是数字", async () => {
    const result = await run("a+b", "a:x b:2")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("不是有效数字") })
  })

  it("错误：非法变量名", async () => {
    const result = await run("a+b", "1a:1 b:2")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("非法变量名") })
  })

  it("错误：缺少变量值", async () => {
    const result = await run("a+b", "a:1")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("缺少变量") })
  })

  it("错误：非法字符", async () => {
    const result = await run("a@b", "a:1 b:2")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("非法字符") })
  })

  it("错误：除零", async () => {
    const result = await run("a/b", "a:1 b:0")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("除零") })
  })

  it("错误：缺少右括号", async () => {
    const result = await run("(1+2")
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("缺少右括号") })
  })

  it("错误：输入槽位不是两个字符串", async () => {
    const result = await runTool(tool, ["1+2"] as unknown as [string, string])
    expect(result).toMatchObject({ ok: false, error: expect.stringContaining("两个字符串") })
  })
})
