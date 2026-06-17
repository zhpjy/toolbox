import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import type { SavedCase } from "@/storage/db"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { previewValue } from "@/features/tool-runner/formatOutput"
import { deleteSavedCase, listSavedCases } from "./savedCaseService"

export function SavedCasePanel({
  toolId,
  refreshKey,
  onLoad
}: {
  toolId: string
  refreshKey: number
  onLoad: (savedCase: SavedCase) => void
}) {
  const [items, setItems] = useState<SavedCase[]>([])

  async function reload() {
    setItems(await listSavedCases(toolId))
  }

  useEffect(() => {
    void reload()
  }, [toolId, refreshKey])

  async function handleDelete(id: string) {
    await deleteSavedCase(id)
    await reload()
  }

  return (
    <Card>
      <CardHeader className="space-y-1 pb-3">
        <CardTitle className="text-base">保存用例</CardTitle>
        <CardDescription>保存常用输入输出，便于反复加载。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">暂无保存用例。</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-md border p-3 text-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.updatedAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => onLoad(item)}>
                    加载
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label="删除用例">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {item.note ? <p className="mb-1 text-xs text-muted-foreground">备注：{item.note}</p> : null}
              <p className="text-xs text-muted-foreground">输入：{previewValue(item.input)}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
