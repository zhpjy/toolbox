import { Textarea } from "@/shared/components/ui/textarea"

type JsonInputProps = {
  value: string
  onChange: (value: string) => void
}

export function JsonToolInput({ value, onChange }: JsonInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={'粘贴 JSON，例如：{"name":"Alice"}'}
      className="min-h-[260px] resize-y font-mono text-sm"
      spellCheck={false}
    />
  )
}

export function JsonToolOutput({ value }: { value: string }) {
  return (
    <pre className="min-h-[220px] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-sm leading-6">
      {value || "运行后显示格式化 JSON。"}
    </pre>
  )
}
