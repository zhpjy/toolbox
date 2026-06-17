import { useEffect, useMemo } from "react"
import { Boxes, Database, Github, Star } from "lucide-react"
import { tools } from "@/generated/tool-registry"
import { toolSearchIndex } from "@/generated/tool-search-index"
import { storage } from "@/storage/indexeddb-storage-adapter"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { Separator } from "@/shared/components/ui/separator"
import { FavoriteToolList } from "@/features/tool-list/FavoriteToolList"
import { RecentToolList } from "@/features/tool-list/RecentToolList"
import { ToolList } from "@/features/tool-list/ToolList"
import { ToolSearchBox } from "@/features/tool-search/ToolSearchBox"
import { searchTools } from "@/features/tool-search/searchTools"
import { toggleFavorite } from "@/features/tool-favorites/favoriteService"
import { ToolRunner } from "@/features/tool-runner/ToolRunner"
import { useAppStore } from "./store"

const toolMap = new Map(tools.map((tool) => [tool.manifest.id, tool]))

export function App() {
  const {
    selectedToolId,
    searchQuery,
    favoriteIds,
    usageStats,
    setSelectedToolId,
    setSearchQuery,
    setFavoriteIds,
    setUsageStats
  } = useAppStore()

  const selectedTool = toolMap.get(selectedToolId ?? "") ?? tools[0]

  async function reloadUserData() {
    const [favorites, stats] = await Promise.all([storage.listFavorites(), storage.listUsageStats()])
    setFavoriteIds(favorites.map((item) => item.toolId))
    setUsageStats(stats)
  }

  useEffect(() => {
    void reloadUserData()
  }, [])

  useEffect(() => {
    if (!selectedToolId || !toolMap.has(selectedToolId)) {
      setSelectedToolId(tools[0].manifest.id)
    }
  }, [selectedToolId, setSelectedToolId])

  const visibleTools = useMemo(
    () =>
      searchTools({
        tools,
        searchIndex: toolSearchIndex,
        query: searchQuery,
        favoriteIds,
        usageStats
      }),
    [searchQuery, favoriteIds, usageStats]
  )

  const favoriteTools = useMemo(
    () => favoriteIds.map((id) => toolMap.get(id)).filter((tool): tool is (typeof tools)[number] => Boolean(tool)),
    [favoriteIds]
  )

  const recentTools = useMemo(() => {
    return Object.values(usageStats)
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
      .map((item) => toolMap.get(item.toolId))
      .filter((tool): tool is (typeof tools)[number] => Boolean(tool))
  }, [usageStats])

  async function handleFavoriteChange(favorite: boolean) {
    await toggleFavorite(selectedTool.manifest.id, favorite)
    await reloadUserData()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/80 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Boxes className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Personal Toolbox</h1>
            </div>
            <p className="text-sm text-muted-foreground">本地优先、静态 Web 可运行的个人工具台。</p>
          </div>
          <div className="w-full max-w-xl">
            <ToolSearchBox value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1600px] gap-4 px-4 py-4 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" />
                收藏工具
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FavoriteToolList tools={favoriteTools} onSelect={setSelectedToolId} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-4 w-4" />
                最近使用
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentToolList tools={recentTools} onSelect={setSelectedToolId} />
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">工具列表</CardTitle>
                <span className="text-xs text-muted-foreground">{visibleTools.length} / {tools.length}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[calc(100vh-340px)] pr-2">
                <ToolList
                  tools={visibleTools}
                  activeToolId={selectedTool.manifest.id}
                  favoriteIds={favoriteIds}
                  usageStats={usageStats}
                  onSelect={setSelectedToolId}
                />
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        <section className="min-w-0 space-y-4">
          <ToolRunner
            key={selectedTool.manifest.id}
            tool={selectedTool}
            isFavorite={favoriteIds.includes(selectedTool.manifest.id)}
            onFavoriteChange={handleFavoriteChange}
            onRunCommitted={reloadUserData}
          />

          <Separator />

          <div className="flex flex-wrap items-center gap-2 pb-4 text-xs text-muted-foreground">
            <Github className="h-3.5 w-3.5" />
            <span>工具逻辑来自 Git 源码，收藏、历史和用例保存在 IndexedDB。</span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => setSearchQuery("")}>显示全部工具</Button>
          </div>
        </section>
      </main>
    </div>
  )
}
