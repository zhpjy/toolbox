import type { ToolDiagnostic } from "@/tool-runtime/types"
import { Badge } from "@/shared/components/ui/badge"
import { cn } from "@/shared/utils/cn"

const severityLabel = {
  error: "错误",
  warning: "警告",
  info: "提示"
} satisfies Record<ToolDiagnostic["severity"], string>

export function DiagnosticsOutput({ diagnostics }: { diagnostics: ToolDiagnostic[] }) {
  if (diagnostics.length === 0) {
    return <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">没有诊断问题。</div>
  }

  return (
    <div className="space-y-2">
      {diagnostics.map((item, index) => (
        <div
          key={`${item.ruleId ?? "diagnostic"}-${index}`}
          className={cn(
            "rounded-md border p-3 text-sm",
            item.severity === "error" && "border-destructive/40 bg-destructive/5",
            item.severity === "warning" && "border-amber-300 bg-amber-50",
            item.severity === "info" && "bg-muted/40"
          )}
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Badge variant={item.severity === "error" ? "destructive" : "secondary"}>{severityLabel[item.severity]}</Badge>
            {item.fieldName ? <span className="font-mono font-semibold">{item.fieldName}</span> : null}
            {item.line ? <span className="text-xs text-muted-foreground">第 {item.line} 行</span> : null}
            {item.ruleId ? <span className="text-xs text-muted-foreground">{item.ruleId}</span> : null}
          </div>
          <p>{item.message}</p>
        </div>
      ))}
    </div>
  )
}
