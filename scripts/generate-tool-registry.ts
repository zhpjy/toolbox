import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

type ParsedManifest = {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  aliases?: string[]
  inputKind: string
  outputKind: string
  autoRun?: boolean
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, "..")
const generatedDir = path.join(rootDir, "src/generated")

function listToolDirs(): string[] {
  const dirs: string[] = []
  const builtinDir = path.join(rootDir, "tools/builtin")

  if (existsSync(builtinDir)) {
    for (const item of readdirSync(builtinDir).sort()) {
      const dir = path.join(builtinDir, item)
      if (statSync(dir).isDirectory() && existsSync(path.join(dir, "index.ts"))) {
        dirs.push(dir)
      }
    }
  }

  const externalDir = path.join(rootDir, "tools/external")
  if (existsSync(externalDir)) {
    for (const packageName of readdirSync(externalDir).sort()) {
      const toolsDir = path.join(externalDir, packageName, "tools")
      if (!existsSync(toolsDir)) continue
      for (const item of readdirSync(toolsDir).sort()) {
        const dir = path.join(toolsDir, item)
        if (statSync(dir).isDirectory() && existsSync(path.join(dir, "index.ts"))) {
          dirs.push(dir)
        }
      }
    }
  }

  return dirs
}

function readStringField(source: string, key: string): string {
  const match = source.match(new RegExp(`${key}\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
  return match ? JSON.parse(`"${match[1]}"`) as string : ""
}

function readBooleanField(source: string, key: string): boolean | undefined {
  const match = source.match(new RegExp(`${key}\\s*:\\s*(true|false)`))
  return match ? match[1] === "true" : undefined
}

function readStringArrayField(source: string, key: string): string[] {
  const match = source.match(new RegExp(`${key}\\s*:\\s*\\[([\\s\\S]*?)\\]`))
  if (!match) return []
  return [...match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((item) => JSON.parse(`"${item[1]}"`) as string)
}

function readManifest(toolDir: string): ParsedManifest {
  const source = readFileSync(path.join(toolDir, "manifest.ts"), "utf8")
  const aliases = readStringArrayField(source, "aliases")
  return {
    id: readStringField(source, "id"),
    name: readStringField(source, "name"),
    description: readStringField(source, "description"),
    category: readStringField(source, "category"),
    tags: readStringArrayField(source, "tags"),
    aliases: aliases.length > 0 ? aliases : undefined,
    inputKind: readStringField(source, "inputKind"),
    outputKind: readStringField(source, "outputKind"),
    autoRun: readBooleanField(source, "autoRun")
  }
}

function toImportPath(toolDir: string): string {
  const relativePath = path.relative(generatedDir, path.join(toolDir, "index")).replaceAll(path.sep, "/")
  return relativePath.startsWith(".") ? relativePath : `./${relativePath}`
}

function generate() {
  const toolDirs = listToolDirs()
  mkdirSync(generatedDir, { recursive: true })

  const manifests = toolDirs.map((dir) => ({ dir, manifest: readManifest(dir) }))
  manifests.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id))

  const registryImports = [
    `import type { RegisteredTool } from "../tool-runtime/types"`,
    ...manifests.map((item, index) => `import { tool as tool_${index} } from "${toImportPath(item.dir)}"`)
  ].join("\n")
  const registryBody = manifests.map((_, index) => `  tool_${index}`).join(",\n")

  writeFileSync(
    path.join(generatedDir, "tool-registry.ts"),
    `${registryImports}\n\nexport const tools: RegisteredTool[] = [\n${registryBody}\n]\n`,
    "utf8"
  )

  const indexItems = manifests.map(({ manifest }) => ({
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: manifest.category,
    tags: manifest.tags,
    aliases: manifest.aliases ?? [],
    inputKind: manifest.inputKind,
    outputKind: manifest.outputKind,
    autoRun: manifest.autoRun ?? false,
    text: [
      manifest.name,
      manifest.description,
      manifest.category,
      ...manifest.tags,
      ...(manifest.aliases ?? [])
    ].join(" ")
  }))

  writeFileSync(
    path.join(generatedDir, "tool-search-index.ts"),
    `export const toolSearchIndex = ${JSON.stringify(indexItems, null, 2)} as const\n`,
    "utf8"
  )

  console.log(`Generated ${manifests.length} tools.`)
}

generate()
