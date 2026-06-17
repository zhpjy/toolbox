import { Textarea } from "@/shared/components/ui/textarea"

type SqlInputProps = {
  value: string
  onChange: (value: string) => void
}

export function SqlToolInput({ value, onChange }: SqlInputProps) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="粘贴 SQL / DDL / 字段清单..."
      className="min-h-[300px] resize-y font-mono text-sm"
      spellCheck={false}
    />
  )
}
