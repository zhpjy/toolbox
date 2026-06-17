import { Star } from "lucide-react"
import type { ToolUsageStats } from "@/storage/db"
import type { RegisteredTool } from "@/tool-runtime/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { cn } from "@/shared/utils/cn"
import { groupToolsByCategory } from "./ToolCategoryList"

export type ToolListProps = {
  tools: RegisteredTool[]
  activeToolId?: string
  favoriteIds: string[]
  usageStats: Record<string, ToolUsageStats>
  onSelect: (toolId: string) => void
}

function ToolRow({
  tool,
  active,
  favorite,
  runCount,
  onSelect
}: {
  tool: RegisteredTool
  active: boolean
  favorite: boolean
  runCount: number
  onSelect: (toolId: string) => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        "h-auto w-full justify-start rounded-lg px-3 py-2 text-left",
        active && "bg-accent text-accent-foreground"
      )}
      onClick={() => onSelect(tool.manifest.id)}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">{tool.manifest.name}</span>
          {favorite ? <Star className="h-3.5 w-3.5 fill-current" /> : null}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{tool.manifest.description}</p>
      </div>
      {runCount > 0 ? <Badge variant="secondary">{runCount}</Badge> : null}
    </Button>
  )
}

export function ToolList({ tools, activeToolId, favoriteIds, usageStats, onSelect }: ToolListProps) {
  const favoriteSet = new Set(favoriteIds)
  const groups = groupToolsByCategory(tools)

  if (tools.length === 0) {
    return <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">没有找到匹配工具。</div>
  }

  return (
    <div className="space-y-5">
      {Object.entries(groups).map(([category, group]) => (
        <section key={category} className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category}</h3>
            <span className="text-xs text-muted-foreground">{group.length}</span>
          </div>
          <div className="space-y-1">
            {group.map((tool) => (
              <ToolRow
                key={tool.manifest.id}
                tool={tool}
                active={tool.manifest.id === activeToolId}
                favorite={favoriteSet.has(tool.manifest.id)}
                runCount={usageStats[tool.manifest.id]?.runCount ?? 0}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
