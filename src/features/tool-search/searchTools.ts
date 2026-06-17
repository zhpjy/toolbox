import type { RegisteredTool } from "@/tool-runtime/types"
import type { ToolUsageStats } from "@/storage/db"

type SearchIndexItem = {
  id: string
  name: string
  description: string
  category: string
  tags: readonly string[]
  aliases: readonly string[]
  text: string
}

export type SearchToolsOptions = {
  tools: RegisteredTool[]
  searchIndex: readonly SearchIndexItem[]
  query: string
  favoriteIds?: string[]
  usageStats?: Record<string, ToolUsageStats>
}

const weights = {
  name: 100,
  aliases: 80,
  tags: 60,
  category: 40,
  description: 20
}

function includesIgnoreCase(source: string, query: string) {
  return source.toLowerCase().includes(query.toLowerCase())
}

function fieldScore(value: string, query: string, weight: number) {
  const source = value.toLowerCase()
  const keyword = query.toLowerCase()
  if (!keyword) return 0
  if (source === keyword) return weight * 2
  if (source.startsWith(keyword)) return weight * 1.5
  if (source.includes(keyword)) return weight
  return 0
}

function arrayFieldScore(values: readonly string[], query: string, weight: number) {
  return values.reduce((score, item) => Math.max(score, fieldScore(item, query, weight)), 0)
}

function scoreItem(item: SearchIndexItem, tokens: string[]) {
  return tokens.reduce((total, token) => {
    const tokenScore = Math.max(
      fieldScore(item.name, token, weights.name),
      arrayFieldScore(item.aliases, token, weights.aliases),
      arrayFieldScore(item.tags, token, weights.tags),
      fieldScore(item.category, token, weights.category),
      fieldScore(item.description, token, weights.description),
      includesIgnoreCase(item.text, token) ? 5 : 0
    )
    return total + tokenScore
  }, 0)
}

export function searchTools({ tools, searchIndex, query, favoriteIds = [], usageStats = {} }: SearchToolsOptions): RegisteredTool[] {
  const favoriteSet = new Set(favoriteIds)
  const toolMap = new Map(tools.map((tool) => [tool.manifest.id, tool]))
  const normalizedQuery = query.trim()
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean)

  const scored = searchIndex
    .map((item) => ({ item, tool: toolMap.get(item.id), score: tokens.length > 0 ? scoreItem(item, tokens) : 0 }))
    .filter((entry): entry is { item: SearchIndexItem; tool: RegisteredTool; score: number } => Boolean(entry.tool))
    .filter((entry) => tokens.length === 0 || entry.score > 0)

  scored.sort((a, b) => {
    const aStats = usageStats[a.item.id]
    const bStats = usageStats[b.item.id]
    const aFavorite = favoriteSet.has(a.item.id) ? 1 : 0
    const bFavorite = favoriteSet.has(b.item.id) ? 1 : 0

    if (tokens.length > 0) {
      return (
        b.score - a.score ||
        bFavorite - aFavorite ||
        (bStats?.lastUsedAt ?? 0) - (aStats?.lastUsedAt ?? 0) ||
        (bStats?.runCount ?? 0) - (aStats?.runCount ?? 0) ||
        a.item.name.localeCompare(b.item.name, "zh-CN")
      )
    }

    return (
      bFavorite - aFavorite ||
      (bStats?.lastUsedAt ?? 0) - (aStats?.lastUsedAt ?? 0) ||
      (bStats?.runCount ?? 0) - (aStats?.runCount ?? 0) ||
      a.item.category.localeCompare(b.item.category, "zh-CN") ||
      a.item.name.localeCompare(b.item.name, "zh-CN")
    )
  })

  return scored.map((entry) => entry.tool)
}
