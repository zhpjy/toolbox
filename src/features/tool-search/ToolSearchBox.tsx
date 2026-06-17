import { Search } from "lucide-react"
import { Input } from "@/shared/components/ui/input"

export function ToolSearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索工具、标签、别名..."
        className="pl-9"
      />
    </div>
  )
}
