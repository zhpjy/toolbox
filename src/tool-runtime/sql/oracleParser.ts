export type ParsedColumn = {
  name: string
  rawName: string
  comment?: string
  line?: number
}

const constraintPrefixes = [
  "CONSTRAINT",
  "PRIMARY",
  "UNIQUE",
  "FOREIGN",
  "CHECK",
  "KEY",
  "INDEX",
  "PARTITION",
  "TABLESPACE"
]

export function stripIdentifierQuotes(identifier: string): string {
  const trimmed = identifier.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/""/g, '"')
  }
  return trimmed
}

export function quoteSqlAlias(alias: string): string {
  return `"${alias.replace(/"/g, '""')}"`
}

export function extractOracleTableName(input: string): string | undefined {
  const match = input.match(/create\s+(?:global\s+temporary\s+)?table\s+((?:"[^"]+"|[A-Za-z0-9_$#]+)(?:\s*\.\s*(?:"[^"]+"|[A-Za-z0-9_$#]+))?)/i)
  if (!match) return undefined
  return match[1].replace(/\s*\.\s*/g, ".")
}

export function stripSqlBlockComments(input: string): string {
  return input.replace(/\/\*[\s\S]*?\*\//g, "")
}

function isConstraintLike(line: string) {
  const upper = line.trim().toUpperCase()
  return constraintPrefixes.some((prefix) => upper === prefix || upper.startsWith(`${prefix} `))
}

function findCreateTableColumnsBlock(input: string): { block: string; startIndex: number } | undefined {
  const createMatch = /create\s+(?:global\s+temporary\s+)?table\b/i.exec(input)
  if (!createMatch) return undefined

  const openIndex = input.indexOf("(", createMatch.index)
  if (openIndex < 0) return undefined

  let depth = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let inLineComment = false
  let inBlockComment = false

  for (let index = openIndex; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (inLineComment) {
      if (char === "\n") inLineComment = false
      continue
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false
        index += 1
      }
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && char === "-" && next === "-") {
      inLineComment = true
      index += 1
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && char === "/" && next === "*") {
      inBlockComment = true
      index += 1
      continue
    }

    if (!inDoubleQuote && char === "'") {
      if (inSingleQuote && next === "'") {
        index += 1
      } else {
        inSingleQuote = !inSingleQuote
      }
      continue
    }

    if (!inSingleQuote && char === '"') {
      if (inDoubleQuote && next === '"') {
        index += 1
      } else {
        inDoubleQuote = !inDoubleQuote
      }
      continue
    }

    if (inSingleQuote || inDoubleQuote) continue

    if (char === "(") depth += 1
    if (char === ")") {
      depth -= 1
      if (depth === 0) {
        return {
          block: input.slice(openIndex + 1, index),
          startIndex: openIndex + 1
        }
      }
    }
  }

  return undefined
}

export function splitTopLevelComma(input: string): Array<{ text: string; startOffset: number }> {
  const parts: Array<{ text: string; startOffset: number }> = []
  let depth = 0
  let start = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let inLineComment = false
  let inBlockComment = false

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (inLineComment) {
      if (char === "\n") inLineComment = false
      continue
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false
        index += 1
      }
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && char === "-" && next === "-") {
      inLineComment = true
      index += 1
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && char === "/" && next === "*") {
      inBlockComment = true
      index += 1
      continue
    }

    if (!inDoubleQuote && char === "'") {
      if (inSingleQuote && next === "'") {
        index += 1
      } else {
        inSingleQuote = !inSingleQuote
      }
      continue
    }

    if (!inSingleQuote && char === '"') {
      if (inDoubleQuote && next === '"') {
        index += 1
      } else {
        inDoubleQuote = !inDoubleQuote
      }
      continue
    }

    if (inSingleQuote || inDoubleQuote) continue

    if (char === "(") depth += 1
    if (char === ")") depth = Math.max(0, depth - 1)

    if (char === "," && depth === 0) {
      parts.push({ text: input.slice(start, index), startOffset: start })
      start = index + 1
    }
  }

  parts.push({ text: input.slice(start), startOffset: start })
  return parts
}

function removeLineCommentsFromPart(input: string): string {
  return input
    .split("\n")
    .map((line) => line.replace(/--.*$/, ""))
    .join("\n")
}

function lineNumberAt(input: string, index: number): number {
  return input.slice(0, index).split("\n").length
}

function parseIdentifier(input: string): string | undefined {
  const quoted = input.match(/^"(?:[^"]|"")+"/)
  if (quoted) return quoted[0]
  const normal = input.match(/^[A-Za-z_][A-Za-z0-9_$#]*/)
  if (!normal) return undefined
  const nextChar = input[normal[0].length]
  if (nextChar && !/[\s,]/.test(nextChar)) return undefined
  return normal[0]
}

function parseColumnToken(input: string): string | undefined {
  return parseIdentifier(input) ?? input.match(/^[^\s,]+/)?.[0]
}

function parseCreateTableColumns(input: string): ParsedColumn[] {
  const blockInfo = findCreateTableColumnsBlock(input)
  if (!blockInfo) return []

  return splitTopLevelComma(blockInfo.block).reduce<ParsedColumn[]>((columns, { text, startOffset }) => {
      const cleaned = removeLineCommentsFromPart(stripSqlBlockComments(text)).trim()
      if (!cleaned || isConstraintLike(cleaned)) return columns

      const rawName = parseColumnToken(cleaned)
      if (!rawName) return columns

      columns.push({
        name: stripIdentifierQuotes(rawName),
        rawName,
        line: lineNumberAt(input, blockInfo.startIndex + startOffset)
      })

      return columns
    }, [])
}

function parseSqlCommentLiteral(input: string): string | undefined {
  const single = input.match(/\bCOMMENT\s+'((?:[^']|'')*)'/i)
  if (single) return single[1].replace(/''/g, "'")

  const double = input.match(/\bCOMMENT\s+"([^"]*)"/i)
  if (double) return double[1]

  return undefined
}

export function extractCommentedColumns(input: string): ParsedColumn[] {
  const columns: ParsedColumn[] = []

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const normalized = rawLine
      .replace(/^\s*--\s?/, "")
      .replace(/^\s*,\s*/, "")
      .trim()

    if (!normalized || isConstraintLike(normalized)) return

    const rawName = parseIdentifier(normalized)
    const comment = parseSqlCommentLiteral(normalized)
    if (!rawName || !comment) return

    columns.push({
      name: stripIdentifierQuotes(rawName),
      rawName: stripIdentifierQuotes(rawName),
      comment,
      line: index + 1
    })
  })

  return columns
}

function parseLooseColumnLines(input: string): ParsedColumn[] {
  const columns: ParsedColumn[] = []

  input.split(/\r?\n/).forEach((rawLine, index) => {
    const withoutCommentPrefix = rawLine.replace(/^\s*--\s?/, "")
    const beforeLineComment = withoutCommentPrefix.replace(/--.*$/, "")
    const normalized = beforeLineComment.replace(/^\s*,\s*/, "").trim()
    if (!normalized || isConstraintLike(normalized)) return

    const legalName = parseIdentifier(normalized)
    const rawName = parseColumnToken(normalized)
    if (!rawName) return

    const rest = normalized.slice(rawName.length).trim()
    const isOnlyIdentifier = rest.length === 0
    const hasTypeOrComma = /^[A-Za-z0-9_"(]/.test(rest) || rawLine.includes(",")
    if (isOnlyIdentifier && !legalName) return
    if (!isOnlyIdentifier && !hasTypeOrComma) return

    columns.push({
      name: stripIdentifierQuotes(rawName),
      rawName,
      comment: parseSqlCommentLiteral(normalized),
      line: index + 1
    })
  })

  return columns
}

export function extractOracleColumns(input: string): ParsedColumn[] {
  const createTableColumns = parseCreateTableColumns(input)
  if (createTableColumns.length > 0) return createTableColumns

  const commentedColumns = extractCommentedColumns(input)
  if (commentedColumns.length > 0) return commentedColumns

  return parseLooseColumnLines(input)
}
