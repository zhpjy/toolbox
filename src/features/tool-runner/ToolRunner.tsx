import { useEffect, useMemo, useRef, useState } from "react"
import { Copy, Eraser, Play, Save, Star } from "lucide-react"
import type { SavedCase, ToolRunHistory } from "@/storage/db"
import { simpleHash } from "@/storage/indexeddb-storage-adapter"
import type { RegisteredTool, ToolDiagnostic } from "@/tool-runtime/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Textarea } from "@/shared/components/ui/textarea"
import { Separator } from "@/shared/components/ui/separator"
import { ToolHistoryPanel } from "@/features/tool-history/ToolHistoryPanel"
import { recordHistory } from "@/features/tool-history/historyService"
import { SavedCasePanel } from "@/features/saved-cases/SavedCasePanel"
import { addSavedCase } from "@/features/saved-cases/savedCaseService"
import { DiagnosticsOutput } from "./DiagnosticsOutput"
import { formatToolOutput } from "./formatOutput"
import { JsonToolInput, JsonToolOutput } from "./JsonToolRunner"
import { runTool } from "./runTool"
import { SqlToolInput } from "./SqlToolRunner"
import { TextToolInput, TextToolOutput } from "./TextToolRunner"

export type ToolRunnerProps = {
  tool: RegisteredTool
  isFavorite: boolean
  onFavoriteChange: (favorite: boolean) => Promise<void> | void
  onRunCommitted: () => Promise<void> | void
}

function createDefaultCaseName(toolName: string) {
  return `${toolName} ${new Date().toLocaleString()}`
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.style.position = "fixed"
  textarea.style.opacity = "0"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  document.body.removeChild(textarea)
}

export function ToolRunner({ tool, isFavorite, onFavoriteChange, onRunCommitted }: ToolRunnerProps) {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState<unknown>(undefined)
  const [error, setError] = useState<string | undefined>()
  const [durationMs, setDurationMs] = useState<number | undefined>()
  const [isRunning, setIsRunning] = useState(false)
  const [copyStatus, setCopyStatus] = useState<string | undefined>()
  const [caseName, setCaseName] = useState("")
  const [caseNote, setCaseNote] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const lastAutoRecordRef = useRef<{ hash: string; at: number } | undefined>()

  const outputText = useMemo(() => formatToolOutput(output, tool.manifest.outputKind), [output, tool.manifest.outputKind])

  useEffect(() => {
    setInput("")
    setOutput(undefined)
    setError(undefined)
    setDurationMs(undefined)
    setCopyStatus(undefined)
    setCaseName("")
    setCaseNote("")
    lastAutoRecordRef.current = undefined
  }, [tool.manifest.id])

  async function execute(mode: "manual" | "auto") {
    setIsRunning(true)
    setError(undefined)
    setCopyStatus(undefined)

    const result = await runTool(tool, input)
    setDurationMs(result.durationMs)
    setIsRunning(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setOutput(result.output)

    const shouldRecord = mode === "manual" || shouldRecordAutoRun(input, result.output)
    if (shouldRecord) {
      await recordHistory({
        toolId: tool.manifest.id,
        input,
        output: result.output,
        durationMs: result.durationMs,
        title: tool.manifest.name
      })
      setRefreshKey((value) => value + 1)
      await onRunCommitted()
    }
  }

  function shouldRecordAutoRun(nextInput: string, nextOutput: unknown) {
    if (!nextInput.trim()) return false

    const now = Date.now()
    const hash = `${simpleHash(nextInput)}:${simpleHash(nextOutput)}`
    const previous = lastAutoRecordRef.current
    if (previous && previous.hash === hash) return false
    if (previous && now - previous.at < 2500) return false

    lastAutoRecordRef.current = { hash, at: now }
    return true
  }

  useEffect(() => {
    if (!tool.manifest.autoRun) return
    if (!input.trim()) {
      setOutput(undefined)
      setError(undefined)
      return
    }

    const timeout = window.setTimeout(() => {
      void execute("auto")
    }, tool.manifest.debounceMs ?? 150)

    return () => window.clearTimeout(timeout)
  }, [input, tool.manifest.id])

  async function handleCopy() {
    await copyToClipboard(outputText)
    setCopyStatus("已复制")
    window.setTimeout(() => setCopyStatus(undefined), 1200)
  }

  function handleClear() {
    setInput("")
    setOutput(undefined)
    setError(undefined)
    setDurationMs(undefined)
  }

  function handleLoadValue(value: unknown, loadedOutput?: unknown) {
    setInput(typeof value === "string" ? value : JSON.stringify(value, null, 2))
    setOutput(loadedOutput)
    setError(undefined)
  }

  async function handleSaveCase() {
    await addSavedCase({
      toolId: tool.manifest.id,
      name: caseName.trim() || createDefaultCaseName(tool.manifest.name),
      input,
      output,
      note: caseNote.trim() || undefined
    })
    setCaseName("")
    setCaseNote("")
    setRefreshKey((value) => value + 1)
  }

  function handleLoadHistory(history: ToolRunHistory) {
    handleLoadValue(history.input, history.output)
  }

  function handleLoadSavedCase(savedCase: SavedCase) {
    handleLoadValue(savedCase.input, savedCase.output)
  }

  function renderInput() {
    if (tool.manifest.inputKind === "json") return <JsonToolInput value={input} onChange={setInput} />
    if (tool.manifest.inputKind === "sql") return <SqlToolInput value={input} onChange={setInput} />
    return <TextToolInput value={input} onChange={setInput} />
  }

  function renderOutput() {
    if (tool.manifest.outputKind === "diagnostics") {
      return <DiagnosticsOutput diagnostics={(Array.isArray(output) ? output : []) as ToolDiagnostic[]} />
    }

    if (tool.manifest.outputKind === "json") {
      return <JsonToolOutput value={outputText} />
    }

    return <TextToolOutput value={outputText} />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{tool.manifest.name}</CardTitle>
                <Badge variant="outline">{tool.manifest.category}</Badge>
                <Badge variant={tool.manifest.autoRun ? "secondary" : "outline"}>
                  {tool.manifest.autoRun ? "自动运行" : "手动运行"}
                </Badge>
              </div>
              <CardDescription>{tool.manifest.description}</CardDescription>
              <div className="flex flex-wrap gap-1.5">
                {tool.manifest.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <Button variant={isFavorite ? "default" : "outline"} onClick={() => onFavoriteChange(!isFavorite)}>
              <Star className="mr-2 h-4 w-4" />
              {isFavorite ? "已收藏" : "收藏"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tool.examples && tool.examples.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">示例：</span>
              {tool.examples.map((example) => (
                <Button
                  key={example.name}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadValue(example.input, example.output)}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">输入</h3>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Eraser className="mr-2 h-4 w-4" />
                  清空
                </Button>
              </div>
              {renderInput()}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">输出</h3>
                  {durationMs !== undefined ? <span className="text-xs text-muted-foreground">{durationMs}ms</span> : null}
                </div>
                <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!outputText}>
                  <Copy className="mr-2 h-4 w-4" />
                  {copyStatus ?? "复制结果"}
                </Button>
              </div>
              {error ? (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                  工具运行失败：{error}
                </div>
              ) : (
                renderOutput()
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => execute("manual")} disabled={isRunning}>
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? "运行中" : "运行"}
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!outputText}>
              <Copy className="mr-2 h-4 w-4" />
              复制结果
            </Button>
          </div>

          <Separator />

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
            <div className="space-y-1">
              <label className="text-sm font-medium">用例名称</label>
              <Input value={caseName} onChange={(event) => setCaseName(event.target.value)} placeholder="留空则自动命名" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={caseNote}
                onChange={(event) => setCaseNote(event.target.value)}
                placeholder="可选"
                className="min-h-10"
              />
            </div>
            <Button variant="secondary" onClick={handleSaveCase} disabled={!input.trim()}>
              <Save className="mr-2 h-4 w-4" />
              保存用例
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <ToolHistoryPanel toolId={tool.manifest.id} refreshKey={refreshKey} onLoad={handleLoadHistory} />
        <SavedCasePanel toolId={tool.manifest.id} refreshKey={refreshKey} onLoad={handleLoadSavedCase} />
      </div>
    </div>
  )
}
