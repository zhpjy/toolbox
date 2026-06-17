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
}

if (errors.length > 0) {
  console.error(errors.join("\n"))
  process.exit(1)
}

console.log(`Validated ${listToolDirs().length} builtin tools.`)
