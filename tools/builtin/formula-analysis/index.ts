import type { Tool } from "@/tool-runtime/types"
import { examples } from "./examples"
import { manifest } from "./manifest"

// ---------------------------------------------------------------------------
// 变量输入解析
// ---------------------------------------------------------------------------

function parseVariables(input: string): Map<string, number> {
  const variables = new Map<string, number>()
  if (!input.trim()) return variables

  for (const part of input.trim().split(/\s+/)) {
    const match = /^([a-zA-Z_]\w*)(?::|=)([+-]?(?:\d+(?:\.\d*)?|\.\d+))$/.exec(part)
    if (!match) {
      const [name, value] = part.split(/[:=]/, 2)
      if (name && !/^[a-zA-Z_]\w*$/.test(name)) {
        throw new Error(`非法变量名: "${name}"，变量名必须以字母或下划线开头`)
      }
      if (value !== undefined) throw new Error(`变量值无效: "${value}" 不是有效数字`)
      throw new Error(`变量格式错误: "${part}"，正确格式如 "x:1" 或 "x=1"，变量之间用空格分隔`)
    }
    const [, name, value] = match
    variables.set(name, Number(value))
  }
  return variables
}

// ---------------------------------------------------------------------------
// Token 化
// ---------------------------------------------------------------------------

type Token =
  | { type: "number"; value: number }
  | { type: "var"; name: string }
  | { type: "op"; value: string }   // + - * /
  | { type: "paren"; value: "(" | ")" }

function tokenize(expr: string): Token[] {
  const tokens: Token[] = []
  let i = 0

  while (i < expr.length) {
    const ch = expr[i]

    // 空白
    if (/\s/.test(ch)) { i++; continue }

    // 数字：整数 / 小数 (可省略整数部分)
    if (/\d/.test(ch) || (ch === "." && i + 1 < expr.length && /\d/.test(expr[i + 1]))) {
      let raw = ""
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        raw += expr[i]
        i++
      }
      if ((raw.match(/\./g) || []).length > 1) {
        throw new Error(`非法数字: "${raw}" 包含多个小数点`)
      }
      const val = parseFloat(raw)
      if (!isFinite(val)) throw new Error(`非法数字: "${raw}"`)
      tokens.push({ type: "number", value: val })
      continue
    }

    // 变量名：字母 / 下划线开头，后跟字母/数字/下划线
    if (/[a-zA-Z_]/.test(ch)) {
      let name = ""
      while (i < expr.length && /\w/.test(expr[i])) {
        name += expr[i]
        i++
      }
      tokens.push({ type: "var", name })
      continue
    }

    // 运算符
    if ("+-*/".includes(ch)) {
      tokens.push({ type: "op", value: ch })
      i++
      continue
    }

    // 括号
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch })
      i++
      continue
    }

    throw new Error(`非法字符: "${ch}"`)
  }

  return tokens
}

// ---------------------------------------------------------------------------
// 递归下降解析器 + 求值器
// ---------------------------------------------------------------------------

class Parser {
  private tokens: Token[]
  private pos = 0

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  parse(variables: Map<string, number>): number {
    const result = this.expr(variables)
    if (this.pos < this.tokens.length) {
      throw new Error("表达式格式错误：运算符之间缺少操作数或存在多余内容")
    }
    return result
  }

  /* ---- 优先级层 ---- */

  // expr = term (('+' | '-') term)*
  private expr(vars: Map<string, number>): number {
    let left = this.term(vars)
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos]
      if (t.type !== "op" || (t.value !== "+" && t.value !== "-")) break
      this.pos++
      const right = this.term(vars)
      left = t.value === "+" ? left + right : left - right
    }
    return left
  }

  // term = factor (('*' | '/') factor)*
  private term(vars: Map<string, number>): number {
    let left = this.factor(vars)
    while (this.pos < this.tokens.length) {
      const t = this.tokens[this.pos]
      if (t.type !== "op" || (t.value !== "*" && t.value !== "/")) break
      this.pos++
      const right = this.factor(vars)
      left = t.value === "*" ? left * right : div(left, right)
    }
    return left
  }

  // factor = NUMBER | VAR | '(' expr ')' | '+' factor | '-' factor
  private factor(vars: Map<string, number>): number {
    const t0 = this.pos < this.tokens.length ? this.tokens[this.pos] : null
    // 一元正号
    if (t0?.type === "op" && t0.value === "+") {
      this.pos++
      return this.factor(vars)
    }
    // 一元负号
    if (t0?.type === "op" && t0.value === "-") {
      this.pos++
      return -this.factor(vars)
    }

    if (this.pos >= this.tokens.length) {
      throw new Error("表达式不完整，缺少操作数")
    }

    const t = this.tokens[this.pos]

    if (t.type === "number") {
      this.pos++
      return t.value
    }

    if (t.type === "var") {
      this.pos++
      const name = t.name
      if (!vars.has(name)) {
        throw new Error(`缺少变量 "${name}" 的值，请在变量输入中定义`)
      }
      return vars.get(name)!
    }

    if (t.type === "paren" && t.value === "(") {
      this.pos++ // 跳过 '('
      const inner = this.expr(vars)
      const closing = this.pos < this.tokens.length ? this.tokens[this.pos] : null
      if (!closing || closing.type !== "paren" || closing.value !== ")") {
        throw new Error("缺少右括号")
      }
      this.pos++ // 跳过 ')'
      return inner
    }

    throw new Error(`意外的 token: ${describeToken(t)}`)
  }
}

function div(a: number, b: number): number {
  if (b === 0) throw new Error("除零错误：除数不能为零")
  return a / b
}

function describeToken(t: Token): string {
  switch (t.type) {
    case "number": return `数字 ${t.value}`
    case "var":    return `变量 ${t.name}`
    case "op":     return `运算符 ${t.value}`
    case "paren":  return `括号 ${t.value}`
  }
}

// ---------------------------------------------------------------------------
// 代入显示：将公式中的变量名替换为实际数值
// ---------------------------------------------------------------------------

function substituteVars(expr: string, variables: Map<string, number>): string {
  return expr.replace(/\b[a-zA-Z_]\w*\b/g, name =>
    variables.has(name) ? String(variables.get(name)) : name
  )
}

// ---------------------------------------------------------------------------
// 数值显示：去除多余的尾随零
// ---------------------------------------------------------------------------

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n)
  // 最多保留 10 位小数，去掉末尾零
  const s = n.toFixed(10).replace(/\.?0+$/, "")
  return s
}

// ---------------------------------------------------------------------------
// Tool 入口
// ---------------------------------------------------------------------------

export const tool = {
  manifest,
  examples,
  run([formula, variablesInput]: string[]) {
    if (typeof formula !== "string" || typeof variablesInput !== "string") {
      throw new Error("输入必须是 [formula, variables] 两个字符串")
    }
    const expression = formula.trim()
    if (!expression) throw new Error("公式不能为空")
    const variables = parseVariables(variablesInput)

    // 代入后的公式字符串（用于显示）
    const substituted = substituteVars(expression, variables)

    // 解析并求值
    const tokens = tokenize(expression)
    const parser = new Parser(tokens)
    const result = parser.parse(variables)

    return [substituted, formatNum(result)]
  }
} satisfies Tool<[string, string], [string, string]>
