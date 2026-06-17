import { Textarea } from "@/shared/components/ui/textarea"

type InputAreaProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TextToolInput({ value, onChange, placeholder }: InputAreaProps) {
  return (
    <Textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder ?? "输入文本..."}
      className="min-h-[220px] resize-y font-mono text-sm"
      spellCheck={false}
    />
  )
}

export function TextToolOutput({ value }: { value: string }) {
  return <Textarea value={value} readOnly className="min-h-[220px] resize-y bg-muted/40 font-mono text-sm" />
}
