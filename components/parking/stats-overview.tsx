import { Car, Check, Clock, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Spot } from "@/lib/types"

export function StatsOverview({ spots }: { spots: Spot[] }) {
  const total = spots.length
  const free = spots.filter((s) => s.status === "free").length
  const busy = spots.filter((s) => s.status === "busy").length
  const reserved = total - free - busy
  const pct = (n: number) => (total ? (n / total) * 100 : 0)
  const occupancy = Math.round(pct(busy + reserved))

  const stats = [
    { label: "ทั้งหมด", value: total, icon: LayoutGrid, tone: "text-foreground bg-secondary" },
    { label: "ว่าง", value: free, icon: Check, tone: "text-free bg-free/15" },
    { label: "ไม่ว่าง", value: busy, icon: Car, tone: "text-busy bg-busy/15" },
    { label: "จองแล้ว", value: reserved, icon: Clock, tone: "text-reserved bg-reserved/15" },
  ]

  return (
    <section aria-label="ภาพรวมที่จอดรถ" className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", tone)}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-mono text-2xl font-semibold tabular-nums leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <p className="text-sm text-muted-foreground">อัตราการใช้งาน</p>
          <p className="font-mono text-sm font-semibold tabular-nums">{occupancy}%</p>
        </div>
        <div
          className="flex h-2.5 overflow-hidden rounded-full bg-secondary"
          role="img"
          aria-label={`ว่าง ${free} ไม่ว่าง ${busy} จองแล้ว ${reserved}`}
        >
          <div className="bg-busy transition-all duration-700" style={{ width: `${pct(busy)}%` }} />
          <div className="bg-reserved transition-all duration-700" style={{ width: `${pct(reserved)}%` }} />
          <div className="bg-free transition-all duration-700" style={{ width: `${pct(free)}%` }} />
        </div>
      </div>
    </section>
  )
}
