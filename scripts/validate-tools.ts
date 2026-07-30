import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")
const requiredFiles = ["index.ts", "manifest.ts", "examples.ts", "test.ts", "README.md"]
const idPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function listToolDirs(): string[] {
  const dirs: string[] = []
  const builtinDir = path.join(rootDir, "tools/builtin")
  if (existsSync(builtinDir)) {
    for (const item of readdirSync(builtinDir).sort()) {
      const dir = path.join(builtinDir, item)
      if (statSync(dir).isDirectory()) dirs.push(dir)
    }
  }
  return dirs
}

function readStringField(source: string, key: string): string {
  const match = source.match(new RegExp(`${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
  return match ? JSON.parse(`"${match[1]}"`) as string : ""
}

function readNumberField(source: string, key: string): number | undefined {
  const match = source.match(new RegExp(`${key}\\s*:\\s*(\\d+)`))
  return match ? Number(match[1]) : undefined
}

function readOptionalStringArrayField(source: string, key: string): string[] | null | undefined {
  const match = source.match(new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`))
  if (!match) return undefined
  try {
    const value: unknown = JSON.parse(`[${match[1]}]`)
    return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : null
  } catch {
    return null
  }
}

function validateSlotLabels(folderName: string, key: "inputLabels" | "outputLabels", labels: string[] | null | undefined, count: number) {
  if (labels === undefined) return
  if (labels === null || labels.length === 0 || labels.some((label) => !label.trim())) {
    errors.push(`${folderName}: ${key} 必须是非空字符串数组`)
    return
  }
  if (labels.length !== count) {
    errors.push(`${folderName}: ${key} 长度必须等于 ${key === "inputLabels" ? "inputCount" : "outputCount"}（${count}），当前为 ${labels.length}`)
  }
}

const errors: string[] = []

for (const dir of listToolDirs()) {
  for (const file of requiredFiles) {
    if (!existsSync(path.join(dir, file))) {
      errors.push(`${path.relative(rootDir, dir)} 缺少 ${file}`)
    }
  }

  const manifestPath = path.join(dir, "manifest.ts")
  if (!existsSync(manifestPath)) continue

  const source = readFileSync(manifestPath, "utf8")
  const id = readStringField(source, "id")
  const folderName = path.basename(dir)

  if (!idPattern.test(id)) errors.push(`${folderName}: id 不是 kebab-case: ${id}`)
  if (id !== folderName) errors.push(`${folderName}: manifest.id 和目录名不一致: ${id}`)
  for (const key of ["name", "description", "category", "inputKind", "outputKind"]) {
    if (!readStringField(source, key)) errors.push(`${folderName}: manifest.${key} 不能为空`)
  }
  const inputCount = readNumberField(source, "inputCount")
  if (inputCount !== undefined && (!Number.isInteger(inputCount) || inputCount < 1)) {
    errors.push(`${folderName}: inputCount 必须是正整数，当前为 ${inputCount}`)
  }
  const outputCount = readNumberField(source, "outputCount")
  if (outputCount !== undefined && (!Number.isInteger(outputCount) || outputCount < 1)) {
    errors.push(`${folderName}: outputCount 必须是正整数，当前为 ${outputCount}`)
  }
  validateSlotLabels(folderName, "inputLabels", readOptionalStringArrayField(source, "inputLabels"), inputCount ?? 1)
  validateSlotLabels(folderName, "outputLabels", readOptionalStringArrayField(source, "outputLabels"), outputCount ?? 1)
}

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exit(1)
}

console.log(`Validated ${listToolDirs().length} builtin tools.`)
