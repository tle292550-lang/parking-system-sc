import { Car, Clock, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { spotLabel, type Spot } from "@/lib/types"

export const STATUS_META = {
  free: { label: "ว่าง", icon: Check },
  busy: { label: "ไม่ว่าง", icon: Car },
  reserved: { label: "จองแล้ว", icon: Clock },
} as const

const STATUS_STYLES = {
  free: "border-free/40 bg-free/10 text-free hover:bg-free/20 hover:border-free cursor-pointer",
  busy: "border-busy/30 bg-busy/10 text-busy cursor-not-allowed",
  reserved: "border-reserved/30 bg-reserved/10 text-reserved cursor-not-allowed",
} as const

export function SpotCell({
  spot,
  dimmed,
  onSelect,
}: {
  spot: Spot
  dimmed?: boolean
  onSelect: (spot: Spot) => void
}) {
  const meta = STATUS_META[spot.status]
  const Icon = meta.icon
  const label = spotLabel(spot)
  const isFree = spot.status === "free"

  return (
    <button
      type="button"
      onClick={() => isFree && onSelect(spot)}
      aria-disabled={!isFree}
      aria-label={`ช่อง ${label} — ${meta.label}${isFree ? " กดเพื่อจอง" : ""}`}
      className={cn(
        "group relative flex aspect-[3/4] flex-col items-center justify-between rounded-lg border-2 px-1 py-2 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        STATUS_STYLES[spot.status],
        isFree && "active:scale-95",
        dimmed && "opacity-25",
      )}
    >
      <span className="font-mono text-[11px] font-semibold tracking-tight text-foreground/80 sm:text-xs">
        {label}
      </span>
      <Icon className={cn("size-5 sm:size-6", isFree && "transition-transform group-hover:scale-110")} aria-hidden="true" />
      <span className="text-[10px] font-medium leading-none sm:text-[11px]">{meta.label}</span>
    </button>
  )
}
