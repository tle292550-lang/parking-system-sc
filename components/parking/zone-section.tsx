import { ArrowRight } from "lucide-react"
import type { Spot } from "@/lib/types"
import { SpotCell } from "./spot-cell"

export function ZoneSection({
  zone,
  spots,
  freeOnly,
  onSelect,
}: {
  zone: string
  spots: Spot[]
  freeOnly: boolean
  onSelect: (spot: Spot) => void
}) {
  const free = spots.filter((s) => s.status === "free").length
  const half = Math.ceil(spots.length / 2)
  const rows = [spots.slice(0, half), spots.slice(half)]

  return (
    <section aria-labelledby={`zone-${zone}`} className="rounded-2xl border bg-card p-4 sm:p-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary font-mono text-lg font-bold">
            {zone}
          </span>
          <div>
            <h2 id={`zone-${zone}`} className="font-semibold leading-tight">
              โซน {zone}
            </h2>
            <p className="text-sm text-muted-foreground">{spots.length} ช่องจอด</p>
          </div>
        </div>
        <span
          className={
            free > 0
              ? "rounded-full bg-free/15 px-3 py-1 text-sm font-medium text-free"
              : "rounded-full bg-busy/15 px-3 py-1 text-sm font-medium text-busy"
          }
        >
          {free > 0 ? `ว่าง ${free} ช่อง` : "เต็ม"}
        </span>
      </header>

      <div className="flex flex-col gap-3">
        <SpotRow spots={rows[0]} freeOnly={freeOnly} onSelect={onSelect} />
        <div className="flex items-center gap-3 py-1 text-xs text-muted-foreground" aria-hidden="true">
          <span className="h-px flex-1 border-t-2 border-dashed border-border" />
          <span className="flex items-center gap-1 font-medium tracking-wide">
            ทางรถวิ่ง <ArrowRight className="size-3.5" />
          </span>
          <span className="h-px flex-1 border-t-2 border-dashed border-border" />
        </div>
        <SpotRow spots={rows[1]} freeOnly={freeOnly} onSelect={onSelect} />
      </div>
    </section>
  )
}

function SpotRow({
  spots,
  freeOnly,
  onSelect,
}: {
  spots: Spot[]
  freeOnly: boolean
  onSelect: (spot: Spot) => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
      {spots.map((spot) => (
        <SpotCell key={spot.id} spot={spot} dimmed={freeOnly && spot.status !== "free"} onSelect={onSelect} />
      ))}
    </div>
  )
}
