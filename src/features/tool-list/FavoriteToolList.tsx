import type { RegisteredTool } from "@/tool-runtime/types"
import { Button } from "@/shared/components/ui/button"

export function FavoriteToolList({ tools, onSelect }: { tools: RegisteredTool[]; onSelect: (toolId: string) => void }) {
  if (tools.length === 0) {
    return <p className="text-xs text-muted-foreground">还没有收藏工具。</p>
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tools.slice(0, 6).map((tool) => (
        <Button key={tool.manifest.id} variant="secondary" size="sm" onClick={() => onSelect(tool.manifest.id)}>
          {tool.manifest.name}
        </Button>
      ))}
    </div>
  )
}
