import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { Copy, Eraser, Play, Star, Trash2 } from "lucide-react"
import type { ToolRunHistory } from "@/storage/db"
import { simpleHash } from "@/storage/indexeddb-storage-adapter"
import type { RegisteredTool, ToolDiagnostic } from "@/tool-runtime/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { ToolHistoryPanel } from "@/features/tool-history/ToolHistoryPanel"
import { recordHistory } from "@/features/tool-history/historyService"
import { DiagnosticsOutput } from "./DiagnosticsOutput"
import { formatToolOutput } from "./formatOutput"
import { JsonToolInput, JsonToolOutput } from "./JsonToolRunner"
import { runTool } from "./runTool"
import { SqlToolInput } from "./SqlToolRunner"
import { TextToolInput, TextToolOutput } from "./TextToolRunner"
import { getInputCount, getOutputCount, renderInputLabel, renderOutputLabel, type ToolManifestWithCounts } from "./types"

export type ToolRunnerProps = {
  tool: RegisteredTool
  isFavorite: boolean
  onFavoriteChange: (favorite: boolean) => Promise<void> | void
  onRunCommitted: () => Promise<void> | void
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

/**
 * 计算 grid item 的 col-span class，按每行最多 3 格规则：
 * 1→满行, 2→均分, 3→三等分, 4→2+2, 5→3+2, 6→3+3, 7→3+2+2, 8→3+3+2 ...
 * 最后一行剩余 1/2 个时自动拉伸至满行。
 */
function getGridItemSpans(count: number): string[] {
  if (count <= 0) return []
  if (count === 1) return ["col-span-6"]

  const fullRows = Math.floor(count / 3)
  const remainder = count % 3
  const rows: number[] = []

  if (remainder === 0) {
    for (let i = 0; i < fullRows; i++) rows.push(3)
  } else if (remainder === 2) {
    for (let i = 0; i < fullRows; i++) rows.push(3)
    rows.push(2)
  } else {
    // remainder === 1: 将最后一排 3 格换成两排 2 格
    for (let i = 0; i < fullRows - 1; i++) rows.push(3)
    rows.push(2)
    rows.push(2)
  }

  const result: string[] = []
  for (const size of rows) {
    const spanClass = size === 3 ? "col-span-2" : size === 2 ? "col-span-3" : "col-span-6"
    for (let i = 0; i < size; i++) result.push(spanClass)
  }
  return result
}

export function ToolRunner({ tool, isFavorite, onFavoriteChange, onRunCommitted }: ToolRunnerProps) {
  const manifest = tool.manifest as ToolManifestWithCounts
  const inputCount = getInputCount(manifest)
  const outputCount = getOutputCount(manifest)

  const inputGridSpans = useMemo(() => getGridItemSpans(inputCount), [inputCount])
  const outputGridSpans = useMemo(() => getGridItemSpans(outputCount), [outputCount])

  async function recordRecentUsage() {
    await recordHistory({
      toolId: tool.manifest.id,
      input: "",
      output: undefined,
      durationMs: 0,
      title: tool.manifest.name
    })
    await onRunCommitted()
  }

  if (tool.manifest.kind === "app" && tool.component) {
    const AppToolComponent = tool.component
    const [activeExample, setActiveExample] = useState<
      | {
          name: string
          input: unknown
          output?: unknown
          nonce: number
        }
      | undefined
    >()

    useEffect(() => {
      setActiveExample(undefined)
    }, [tool.manifest.id])

    useEffect(() => {
      void recordRecentUsage()
    }, [tool.manifest.id])

    return (
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{tool.manifest.name}</CardTitle>
                <Badge variant="outline">{tool.manifest.category}</Badge>
                <Badge variant="secondary">应用工具</Badge>
              </div>
              <CardDescription>{tool.manifest.description}</CardDescription>
              <div className="flex flex-wrap gap-1.5">
                {tool.manifest.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              {tool.examples && tool.examples.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-sm text-muted-foreground">示例：</span>
                  {tool.examples.map((example) => (
                    <Button
                      key={example.name}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setActiveExample({
                          name: example.name,
                          input: example.input,
                          output: example.output,
                          nonce: Date.now()
                        })
                      }
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              ) : null}
            </div>
            <Button variant={isFavorite ? "default" : "outline"} onClick={() => onFavoriteChange(!isFavorite)}>
              <Star className="mr-2 h-4 w-4" />
              {isFavorite ? "已收藏" : "收藏"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">工具加载中...</div>}>
            <AppToolComponent tool={tool} activeExample={activeExample} />
          </Suspense>
        </CardContent>
      </Card>
    )
  }

  const [inputs, setInputs] = useState<string[]>(() => Array(inputCount).fill(""))
  const [outputs, setOutputs] = useState<unknown[]>(() => Array(outputCount).fill(undefined))
  const [errors, setErrors] = useState<string[]>(() => Array(outputCount).fill(""))
  const [durationMs, setDurationMs] = useState<number | undefined>()
  const [isRunning, setIsRunning] = useState(false)
  const [copyStatus, setCopyStatus] = useState<{ index: number; text: string } | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  const lastAutoRecordRef = useRef<{ hash: string; at: number } | undefined>()

  const outputTexts = useMemo(
    () => outputs.map((output, i) => formatToolOutput(output, tool.manifest.outputKind)),
    [outputs, tool.manifest.outputKind]
  )

  useEffect(() => {
    setInputs(Array(inputCount).fill(""))
    setOutputs(Array(outputCount).fill(undefined))
    setErrors(Array(outputCount).fill(""))
    setDurationMs(undefined)
    setCopyStatus(undefined)
    lastAutoRecordRef.current = undefined
  }, [tool.manifest.id, inputCount, outputCount])

  // autoRun effect
  useEffect(() => {
    if (!tool.manifest.autoRun) return

    const hasInput = inputCount > 1
      ? inputs.every((v) => v.trim().length > 0)
      : (inputs[0] ?? "").trim().length > 0

    if (!hasInput) {
      setOutputs(Array(outputCount).fill(undefined))
      setErrors(Array(outputCount).fill(""))
      return
    }

    const timeout = window.setTimeout(() => {
      void execute("auto")
    }, tool.manifest.debounceMs ?? 150)

    return () => window.clearTimeout(timeout)
  }, [inputs, tool.manifest.id, inputCount, outputCount, tool.manifest.autoRun, tool.manifest.debounceMs])

  async function execute(mode: "manual" | "auto") {
    setIsRunning(true)
    setErrors(Array(outputCount).fill(""))
    setCopyStatus(undefined)

    const inputToRun = inputCount > 1 ? inputs : (inputs[0] ?? "")
    const result = await runTool(tool, inputToRun)
    setDurationMs(result.durationMs)
    setIsRunning(false)

    if (!result.ok) {
      const newErrors = [...errors]
      newErrors[0] = result.error
      setErrors(newErrors)
      return
    }

    const newOutputs = [...outputs]
    if (outputCount > 1 && Array.isArray(result.output)) {
      result.output.forEach((out, idx) => {
        if (idx < outputCount) newOutputs[idx] = out
      })
    } else {
      newOutputs[0] = result.output
    }
    setOutputs(newOutputs)

    const shouldRecord = mode === "manual" || shouldRecordAutoRun(inputToRun, result.output)
    if (shouldRecord) {
      await recordHistory({
        toolId: tool.manifest.id,
        input: inputToRun,
        output: result.output,
        durationMs: result.durationMs,
        title: tool.manifest.name
      })
      setRefreshKey((value) => value + 1)
      await onRunCommitted()
    }
  }

  function shouldRecordAutoRun(nextInput: unknown, nextOutput: unknown) {
    const hash = simpleHash(`${JSON.stringify(nextInput)}|${JSON.stringify(nextOutput)}`)
    const now = Date.now()
    if (lastAutoRecordRef.current && lastAutoRecordRef.current.hash === hash && now - lastAutoRecordRef.current.at < 2000) {
      return false
    }
    lastAutoRecordRef.current = { hash, at: now }
    return true
  }

  async function handleCopy(index: number) {
    await copyToClipboard(outputTexts[index])
    setCopyStatus({ index, text: "已复制" })
    setTimeout(() => setCopyStatus(undefined), 2000)
  }

  function handleClear(index: number) {
    const newOutputs = [...outputs]
    newOutputs[index] = undefined
    setOutputs(newOutputs)

    const newErrors = [...errors]
    newErrors[index] = ""
    setErrors(newErrors)

    if (index === 0) {
      setDurationMs(undefined)
    }
  }

  function handleClearAll() {
    setOutputs(Array(outputCount).fill(undefined))
    setErrors(Array(outputCount).fill(""))
    setDurationMs(undefined)
    setCopyStatus(undefined)
  }

  function handleLoadHistory(history: ToolRunHistory) {
    const newInputs = [...inputs]
    const newOutputs = Array(outputCount).fill(undefined)
    const newErrors = Array(outputCount).fill("")

    if (inputCount > 1 && Array.isArray(history.input)) {
      history.input.forEach((val, idx) => {
        if (idx < inputCount) {
          newInputs[idx] = typeof val === "string" ? val : JSON.stringify(val, null, 2)
        }
      })
    } else {
      newInputs[0] = typeof history.input === "string" ? history.input : JSON.stringify(history.input, null, 2)
    }

    if (outputCount > 1 && Array.isArray(history.output)) {
      history.output.forEach((val, idx) => {
        if (idx < outputCount) newOutputs[idx] = val
      })
    } else {
      newOutputs[0] = history.output
    }

    setInputs(newInputs)
    setOutputs(newOutputs)
    setErrors(newErrors)
    setDurationMs(undefined)
    setCopyStatus(undefined)
  }

  function renderInputArea(index: number) {
    const value = inputs[index] ?? ""
    const onChange = (newValue: string) => {
      const newInputs = [...inputs]
      newInputs[index] = newValue
      setInputs(newInputs)
    }

    const inputLabel = manifest.inputLabels?.[index]
    const textPlaceholder = inputLabel ? `请输入${inputLabel}...` : undefined

    switch (tool.manifest.inputKind) {
      case "text":
        return <TextToolInput value={value} onChange={onChange} placeholder={textPlaceholder ?? "输入文本..."} />
      case "json":
        return <JsonToolInput value={value} onChange={onChange} />
      case "sql":
        return <SqlToolInput value={value} onChange={onChange} />
      default:
        return <TextToolInput value={value} onChange={onChange} placeholder={textPlaceholder ?? "输入内容..."} />
    }
  }

  function renderOutputArea(index: number) {
    const error = errors[index]
    const outputText = outputTexts[index]
    const hasOutput = outputs[index] !== undefined
    const isCopied = copyStatus?.index === index

    if (error) {
      return (
        <div className="min-h-[220px] rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <pre className="whitespace-pre-wrap font-mono text-sm">{error}</pre>
        </div>
      )
    }

    const showCopyClear = hasOutput && !error

    switch (tool.manifest.outputKind) {
      case "text": {
        return (
          <div className="relative">
            <TextToolOutput value={outputText} />
            {showCopyClear && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="复制输出"
                >
                  <Copy className={`h-3.5 w-3.5 ${isCopied ? "text-primary" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleClear(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="清空输出"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      }
      case "json": {
        return (
          <div className="relative">
            <JsonToolOutput value={outputText} />
            {showCopyClear && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="复制输出"
                >
                  <Copy className={`h-3.5 w-3.5 ${isCopied ? "text-primary" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleClear(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="清空输出"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      }
      case "diagnostics": {
        return <DiagnosticsOutput diagnostics={outputs[index] as ToolDiagnostic[]} />
      }
      default: {
        return (
          <div className="relative">
            <TextToolOutput value={outputText} />
            {showCopyClear && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="复制输出"
                >
                  <Copy className={`h-3.5 w-3.5 ${isCopied ? "text-primary" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleClear(index)}
                  disabled={isRunning}
                  className="h-8 w-8"
                  title="清空输出"
                >
                  <Eraser className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      }
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{tool.manifest.name}</CardTitle>
              <Badge variant="outline">{tool.manifest.category}</Badge>
              <Badge variant="secondary">标准工具</Badge>
            </div>
            <CardDescription>{tool.manifest.description}</CardDescription>
            <div className="flex flex-wrap gap-1.5">
              {tool.manifest.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            {tool.examples && tool.examples.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-sm text-muted-foreground">示例：</span>
                {tool.examples.map((example) => (
                  <Button
                    key={example.name}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newInputs = [...inputs]
                      if (inputCount > 1 && Array.isArray(example.input)) {
                        example.input.forEach((val, idx) => {
                          if (idx < inputCount) {
                            newInputs[idx] = typeof val === "string" ? val : JSON.stringify(val, null, 2)
                          }
                        })
                      } else {
                        newInputs[0] = typeof example.input === "string" ? example.input : JSON.stringify(example.input, null, 2)
                      }
                      setInputs(newInputs)
                    }}
                  >
                    {example.name}
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
          <Button variant={isFavorite ? "default" : "outline"} onClick={() => onFavoriteChange(!isFavorite)}>
            <Star className="mr-2 h-4 w-4" />
            {isFavorite ? "已收藏" : "收藏"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Inputs section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-medium">输入</h3>
              {inputCount > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  共 {inputCount} 个输入
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: inputCount }, (_, i) => (
                <div key={i} className={`space-y-2 ${inputGridSpans[i]}`}>
                  {inputCount > 1 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{renderInputLabel(i, inputCount, manifest.inputLabels)}</span>
                    </div>
                  )}
                  <div className="rounded-lg border bg-background p-3">{renderInputArea(i)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-medium">输出</h3>
              {outputCount > 1 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  共 {outputCount} 个输出
                </div>
              )}
              {outputs.some((o, i) => o !== undefined && !errors[i]) && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Button variant="outline" size="sm" onClick={handleClearAll} disabled={isRunning} className="ml-auto">
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    全部清空
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: outputCount }, (_, i) => (
                <div key={i} className={`space-y-2 ${outputGridSpans[i]}`}>
                  <div className="flex items-center justify-between">
                    {outputCount > 1 && (
                      <span className="text-xs font-medium text-muted-foreground">{renderOutputLabel(i, outputCount, manifest.outputLabels)}</span>
                    )}
                    {outputs[i] !== undefined && !errors[i] && (
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(i)}
                          disabled={isRunning}
                          className="h-8 w-8"
                          title="复制输出"
                        >
                          <Copy className={`h-3.5 w-3.5 ${copyStatus?.index === i ? "text-primary" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleClear(i)}
                          disabled={isRunning}
                          className="h-8 w-8"
                          title="清空输出"
                        >
                          <Eraser className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border bg-background p-3 min-h-[220px]">{renderOutputArea(i)}</div>
                  {errors[i] && <div className="text-xs text-destructive">执行失败</div>}
                </div>
              ))}
            </div>
            {(durationMs !== undefined || errors.some((e) => e)) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                {durationMs !== undefined && <span>耗时：{durationMs}ms</span>}
                {errors.some((e) => e) && <span className="text-destructive">执行失败</span>}
              </div>
            )}
          </div>

          {/* Run actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={() => execute("manual")} disabled={isRunning}>
              <Play className="mr-2 h-4 w-4" />
              {isRunning ? "运行中" : "运行"}
            </Button>
            {outputs.some((o, i) => o !== undefined && !errors[i]) && (
              <Button variant="outline" onClick={() => handleCopy(0)} disabled={isRunning || !outputTexts[0]}>
                <Copy className="mr-2 h-4 w-4" />
                复制结果
              </Button>
            )}
          </div>
        </div>
        <div className="mt-6">
          <ToolHistoryPanel key={refreshKey} toolId={tool.manifest.id} refreshKey={refreshKey} onLoad={handleLoadHistory} />
        </div>
      </CardContent>
    </Card>
  )
}