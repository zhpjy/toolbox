import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { ArrowLeftRight, FileSpreadsheet, RefreshCcw } from "lucide-react"
import { HotTable } from "@handsontable/react"
import { registerAllModules } from "handsontable/registry"
import * as daff from "daff/lib/core.js"
import * as XLSX from "xlsx"
import "handsontable/styles/handsontable.css"
import "handsontable/styles/ht-theme-main.css"
import type { ToolAppComponentProps } from "@/tool-runtime/types"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { cn } from "@/shared/utils/cn"
import "./excel-compare.css"

registerAllModules()

type CellValue = string | number | boolean | null
type GridData = CellValue[][]
type WorkbookState = {
  workbook?: XLSX.WorkBook
  sheetNames: string[]
  activeSheet: string
}

const MIN_ROWS = 12
const MIN_COLS = 8

const SAMPLE_LEFT: GridData = [
  ["Date", "High", "Low", "Close", "Volume", "ask", "cash"],
  ["2019-07-08 00:00:00", "11540.33", "11469.53", "11506.43", "10.77073088", "0", "100000000"],
  ["2019-07-07 19:00:00", "11610.0", "11432.32", "11547.98", "67.915214697", "0", "100000000"],
  ["2019-07-07 18:00:00", "11525.0", "11426.74", "11470.47", "31.1094771869", "0", "100000000"],
  ["2019-07-07 16:00:00", "11254.97", "11135.01", "11201.6", "23.5194946648", "0", "100000000"],
  ["2019-07-07 15:00:00", "11408.02", "11189.0", "11254.97", "64.0821938629", "0", "100000000"]
]

const SAMPLE_RIGHT: GridData = [
  ["Date", "High", "Low", "Close", "Volume", "bid", "ask", "Buy"],
  ["2019-07-07 23:00:00", "11482.72", "11423.0", "11475.07", "32.99655899", "6", "0", "3"],
  ["2019-07-07 19:00:00", "11610.0", "11432.32", "11547.98", "67.915214697", "6", "0", "9"],
  ["2019-07-07 18:10:00", "11525.0", "11426.74", "11470.47", "31.1094771869", "6", "0", "9"],
  ["2019-07-07 17:20:00", "11566.23", "11211.56", "11503.4", "121.5246740453", "6", "0", "9"],
  ["2019-07-07 16:00:00", "11254.97", "11135.01", "11200.6", "23.5194946648", "6", "0", "9"],
  ["2019-07-07 15:00:00", "11408.02", "11189.0", "11254.97", "64.0821938629", "6", "1", "9"]
]

function createBlankGrid(rows = MIN_ROWS, cols = MIN_COLS): GridData {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => ""))
}

function normalizeGrid(data: unknown): GridData {
  const source = Array.isArray(data) ? data : []
  const rows = source.map((row) => (Array.isArray(row) ? row : [row]))
  const width = Math.max(MIN_COLS, rows.reduce((max, row) => Math.max(max, row.length), 0))
  const height = Math.max(MIN_ROWS, rows.length)

  return Array.from({ length: height }, (_, rowIndex) => {
    const row = rows[rowIndex] ?? []
    return Array.from({ length: width }, (_, colIndex) => {
      const value = row[colIndex]
      return value === undefined ? "" : (value as CellValue)
    })
  })
}

function cloneGrid(data: GridData): GridData {
  return data.map((row) => [...row])
}

function gridsEqual(left: GridData, right: GridData) {
  if (left.length !== right.length) return false

  for (let rowIndex = 0; rowIndex < left.length; rowIndex += 1) {
    const leftRow = left[rowIndex] ?? []
    const rightRow = right[rowIndex] ?? []

    if (leftRow.length !== rightRow.length) return false

    for (let colIndex = 0; colIndex < leftRow.length; colIndex += 1) {
      if (leftRow[colIndex] !== rightRow[colIndex]) return false
    }
  }

  return true
}

function parseWorkbookSheet(workbook: XLSX.WorkBook, sheetName: string): GridData {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) return createBlankGrid()
  return normalizeGrid(XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" }))
}

function trimGrid(data: GridData): GridData {
  const copy = cloneGrid(data)
  const table = new daff.TableView(copy)
  table.trim()
  const trimmed = table.getData() as GridData
  return trimmed.length > 0 ? trimmed : [[]]
}

function toDisplayCell(value: CellValue) {
  if (value === null) return "∅"
  if (value === undefined) return ""
  return String(value)
}

function resolveDiffClass(value: CellValue, rowIndex: number, colIndex: number, rowAction: string) {
  const text = value == null ? "" : String(value)

  if (value === null) return "null"
  if (text === "..." || text === "…") return "gap"
  if (rowIndex === 0) return "spec"
  if (rowAction === "@@") return colIndex <= 1 ? "spec" : "header"
  if (rowAction === "+++") return "add"
  if (rowAction === "---") return "remove"
  if (rowAction === ":") return "move"
  if (text.includes("!->")) return "conflict"
  if (rowAction === "->" && text.includes("->")) return "modify"
  if (colIndex === 1 && ["+++", "---", "->", ":", "@@"].includes(text)) {
    return text === "@@" ? "spec" : text === "+++" ? "add" : text === "---" ? "remove" : text === ":" ? "move" : "modify"
  }
  if (rowIndex === 1 && colIndex > 1) {
    if (text === "+++") return "add"
    if (text === "---") return "remove"
    if (text === ":") return "move"
  }
  if (colIndex === 0) return rowIndex <= 1 ? "spec" : "index"
  return ""
}

function buildDiff(left: GridData, right: GridData) {
  const leftTable = new daff.TableView(trimGrid(left))
  const rightTable = new daff.TableView(trimGrid(right))
  const alignment = daff.compareTables(leftTable, rightTable).align()
  const flags = new daff.CompareFlags()
  flags.show_unchanged = false
  flags.always_show_header = true
  flags.always_show_order = true
  flags.never_show_order = false
  flags.unchanged_context = true

  const output = new daff.TableView([])
  const tableDiff = new daff.TableDiff(alignment, flags)
  tableDiff.hilite(output)

  const raw = (output.getData() as GridData) ?? []
  const normalized = raw.length > 0 ? raw : [["", "", "未发现差异"]]
  const data = normalized.map((row) => row.map((value) => toDisplayCell(value)))
  const classes: Record<string, string> = {}
  const counts = { add: 0, remove: 0, modify: 0, move: 0, conflict: 0 }

  normalized.forEach((row, rowIndex) => {
    const rowAction = rowIndex === 0 ? "spec" : String(row[1] ?? "")
    row.forEach((value, colIndex) => {
      const className = resolveDiffClass(value, rowIndex, colIndex, rowAction)
      if (className) {
        classes[`${rowIndex}:${colIndex}`] = className
        if (className in counts) counts[className as keyof typeof counts] += 1
      }
    })
  })

  return { data, classes, counts, hasDiff: raw.length > 0 }
}

function SpreadsheetPane({
  title,
  data,
  workbookState,
  fileInputRef,
  onUpload,
  onSheetChange,
  onDataChange
}: {
  title: string
  data: GridData
  workbookState: WorkbookState
  fileInputRef: RefObject<HTMLInputElement>
  onUpload: (file: File | undefined) => Promise<void>
  onSheetChange: (sheetName: string) => void
  onDataChange: (data: GridData) => void
}) {
  const hotTableRef = useRef<any>(null)
  const [tableData, setTableData] = useState<GridData>(() => cloneGrid(data))
  const isSyncingFromPropsRef = useRef(false)

  useEffect(() => {
    if (gridsEqual(tableData, data)) return
    isSyncingFromPropsRef.current = true
    setTableData(cloneGrid(data))
  }, [data, tableData])

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="h-4 w-4" />
            {title}
          </CardTitle>
          <Badge variant="outline">.xlsx</Badge>
        </div>
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="flex-1">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".xlsx"
              onChange={(event) => void onUpload(event.target.files?.[0])}
              className="cursor-pointer"
            />
          </div>
          <select
            value={workbookState.activeSheet}
            onChange={(event) => onSheetChange(event.target.value)}
            disabled={workbookState.sheetNames.length === 0}
            className="flex h-10 min-w-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {workbookState.sheetNames.length === 0 ? <option value="">首个 Sheet</option> : null}
            {workbookState.sheetNames.map((sheetName) => (
              <option key={sheetName} value={sheetName}>
                {sheetName}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="excel-compare-sheet rounded-lg border bg-background p-2">
          <HotTable
            ref={hotTableRef}
            data={tableData}
            rowHeaders
            colHeaders
            stretchH="all"
            height={420}
            licenseKey="non-commercial-and-evaluation"
            contextMenu
            manualColumnResize
            manualRowResize
            copyPaste
            autoWrapRow
            autoWrapCol
            afterChange={(changes, source) => {
              if (isSyncingFromPropsRef.current) {
                isSyncingFromPropsRef.current = false
                return
              }
              if (source === "loadData") return
              if (!changes || changes.length === 0) return

              const nextData = cloneGrid((hotTableRef.current?.hotInstance?.getData() as GridData | undefined) ?? tableData)

              if (gridsEqual(nextData, tableData)) return

              setTableData(nextData)
              onDataChange(nextData)
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default function ExcelCompareApp({ activeExample }: ToolAppComponentProps) {
  const blank = useMemo(() => createBlankGrid(), [])
  const [leftData, setLeftData] = useState<GridData>(cloneGrid(blank))
  const [rightData, setRightData] = useState<GridData>(cloneGrid(blank))
  const [leftWorkbookState, setLeftWorkbookState] = useState<WorkbookState>({ sheetNames: [], activeSheet: "" })
  const [rightWorkbookState, setRightWorkbookState] = useState<WorkbookState>({ sheetNames: [], activeSheet: "" })
  const [diffData, setDiffData] = useState<string[][]>([])
  const [diffClasses, setDiffClasses] = useState<Record<string, string>>({})
  const [diffCounts, setDiffCounts] = useState({ add: 0, remove: 0, modify: 0, move: 0, conflict: 0 })
  const [diffStatus, setDiffStatus] = useState("点击 Diff 开始比较")
  const leftFileInputRef = useRef<HTMLInputElement>(null)
  const rightFileInputRef = useRef<HTMLInputElement>(null)

  async function handleWorkbookUpload(side: "left" | "right", file: File | undefined) {
    if (!file) return

    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" })
    const firstSheet = workbook.SheetNames[0] ?? ""
    const data = firstSheet ? parseWorkbookSheet(workbook, firstSheet) : createBlankGrid()
    const nextState: WorkbookState = {
      workbook,
      sheetNames: workbook.SheetNames,
      activeSheet: firstSheet
    }

    if (side === "left") {
      setLeftWorkbookState(nextState)
      setLeftData(data)
    } else {
      setRightWorkbookState(nextState)
      setRightData(data)
    }
  }

  function handleSheetChange(side: "left" | "right", sheetName: string) {
    const state = side === "left" ? leftWorkbookState : rightWorkbookState
    if (!state.workbook || !sheetName) return
    const data = parseWorkbookSheet(state.workbook, sheetName)

    if (side === "left") {
      setLeftWorkbookState({ ...state, activeSheet: sheetName })
      setLeftData(data)
    } else {
      setRightWorkbookState({ ...state, activeSheet: sheetName })
      setRightData(data)
    }
  }

  function handleDiff() {
    const result = buildDiff(leftData, rightData)
    setDiffData(result.data)
    setDiffClasses(result.classes)
    setDiffCounts(result.counts)
    setDiffStatus(result.hasDiff ? "Diff 已生成，颜色语义参考 daff 高亮格式。" : "未发现差异")
  }

  function handleSample() {
    setLeftWorkbookState({ sheetNames: [], activeSheet: "" })
    setRightWorkbookState({ sheetNames: [], activeSheet: "" })
    setLeftData(normalizeGrid(SAMPLE_LEFT))
    setRightData(normalizeGrid(SAMPLE_RIGHT))
    setDiffData([])
    setDiffClasses({})
    setDiffCounts({ add: 0, remove: 0, modify: 0, move: 0, conflict: 0 })
    setDiffStatus("已载入 Sample 数据")
    if (leftFileInputRef.current) leftFileInputRef.current.value = ""
    if (rightFileInputRef.current) rightFileInputRef.current.value = ""
  }

  function handleReset() {
    setLeftWorkbookState({ sheetNames: [], activeSheet: "" })
    setRightWorkbookState({ sheetNames: [], activeSheet: "" })
    setLeftData(cloneGrid(blank))
    setRightData(cloneGrid(blank))
    setDiffData([])
    setDiffClasses({})
    setDiffCounts({ add: 0, remove: 0, modify: 0, move: 0, conflict: 0 })
    setDiffStatus("已重置，可重新上传或粘贴数据")
    if (leftFileInputRef.current) leftFileInputRef.current.value = ""
    if (rightFileInputRef.current) rightFileInputRef.current.value = ""
  }

  useEffect(() => {
    if (activeExample?.input === "sample") {
      handleSample()
    }
  }, [activeExample])

  const diffSummary = [
    ["新增", diffCounts.add],
    ["删除", diffCounts.remove],
    ["修改", diffCounts.modify],
    ["移动", diffCounts.move],
    ["冲突", diffCounts.conflict]
  ] as const

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <SpreadsheetPane
          title="Original"
          data={leftData}
          workbookState={leftWorkbookState}
          fileInputRef={leftFileInputRef}
          onUpload={(file) => handleWorkbookUpload("left", file)}
          onSheetChange={(sheetName) => handleSheetChange("left", sheetName)}
          onDataChange={setLeftData}
        />

        <SpreadsheetPane
          title="Modified"
          data={rightData}
          workbookState={rightWorkbookState}
          fileInputRef={rightFileInputRef}
          onUpload={(file) => handleWorkbookUpload("right", file)}
          onSheetChange={(sheetName) => handleSheetChange("right", sheetName)}
          onDataChange={setRightData}
        />

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <ArrowLeftRight className="h-4 w-4" />
              操作
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" onClick={handleDiff}>
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              Diff
            </Button>
            <Button className="w-full" onClick={handleReset} variant="outline">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <p className="text-xs leading-5 text-muted-foreground">上传后自动读取首个 Sheet，也可直接在表格中粘贴/编辑数据再执行 Diff。</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Diff 结果</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{diffStatus}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {diffSummary.map(([label, count]) => (
                <Badge key={label} variant="outline" className={cn("min-w-16 justify-center", count > 0 && "font-semibold")}>
                  {label} {count}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-add">add</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-remove">remove</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-modify">modify</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-move">move</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-conflict">conflict</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-spec">spec/header</Badge>
            <Badge variant="secondary" className="excel-compare-legend excel-compare-legend-null">null/gap</Badge>
          </div>

          <div className="excel-compare-sheet excel-compare-diff rounded-lg border bg-background p-2">
            <HotTable
              data={diffData.length > 0 ? diffData : [["", "", "暂无 Diff 结果"]]}
              rowHeaders
              colHeaders
              stretchH="all"
              height={420}
              licenseKey="non-commercial-and-evaluation"
              readOnly
              copyPaste
              manualColumnResize
              className="excel-compare-highlighter"
              cells={(row, col) => ({ className: diffClasses[`${row}:${col}`] ?? "" })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
