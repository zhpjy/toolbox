import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import type { ToolRunHistory } from "@/storage/db"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { previewValue } from "@/features/tool-runner/formatOutput"
import { clearHistories, deleteHistory, listHistories } from "./historyService"

export function ToolHistoryPanel({
  toolId,
  refreshKey,
  onLoad
}: {
  toolId: string
  refreshKey: number
  onLoad: (history: ToolRunHistory) => void
}) {
  const [items, setItems] = useState<ToolRunHistory[]>([])

  async function reload() {
    setItems(await listHistories(toolId, 20))
  }

  useEffect(() => {
    void reload()
  }, [toolId, refreshKey])

  async function handleDelete(id: string) {
    await deleteHistory(id)
    await reload()
  }

  async function handleClear() {
    await clearHistories(toolId)
    await reload()
  }

  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">运行历史</CardTitle>
            <CardDescription>自动记录最近运行结果，重复输入会合并。</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClear} disabled={items.length === 0}>
            清空
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无历史。</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-md border p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {new Date(item.createdAt).toLocaleString()} {item.durationMs !== undefined ? `· ${item.durationMs}ms` : ""}
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => onLoad(item)}>
                    加载
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label="删除历史">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">输入：{previewValue(item.input)}</p>
              <p className="mt-1 text-xs text-muted-foreground">输出：{previewValue(item.output)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
