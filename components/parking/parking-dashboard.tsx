"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { SquareParking, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Spot } from "@/lib/types"
import { StatsOverview } from "./stats-overview"
import { ZoneSection } from "./zone-section"
import { ReserveDialog } from "./reserve-dialog"
import { STATUS_META } from "./spot-cell"

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ")
    return r.json() as Promise<Spot[]>
  })

export function ParkingDashboard() {
  const { data: spots, error, isLoading, mutate } = useSWR("/api/spots", fetcher, {
    refreshInterval: 4000,
  })
  const [zone, setZone] = useState<string>("all")
  const [freeOnly, setFreeOnly] = useState(false)
  const [selected, setSelected] = useState<Spot | null>(null)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const zones = useMemo(() => {
    const map = new Map<string, Spot[]>()
    for (const s of spots ?? []) map.set(s.zone_id, [...(map.get(s.zone_id) ?? []), s])
    return map
  }, [spots])

  const [lastSpots, setLastSpots] = useState(spots)
  if (spots !== lastSpots) {
    setLastSpots(spots)
    setUpdatedAt(new Date())
  }

  const visibleZones = [...zones.keys()].filter((z) => zone === "all" || z === zone)
  const scopedSpots = zone === "all" ? (spots ?? []) : (zones.get(zone) ?? [])
  const firstFree = scopedSpots.find((s) => s.status === "free")

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-5 sm:px-6 sm:pb-10 lg:pt-8">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <SquareParking className="size-6" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight sm:text-xl">Smart Parking</h1>
            <p className="text-sm text-muted-foreground">ดูช่องจอดว่างแบบเรียลไทม์</p>
          </div>
        </div>
        <LiveIndicator updatedAt={updatedAt} error={Boolean(error)} />
      </header>

      {error && !spots ? (
        <div className="rounded-2xl border border-busy/40 bg-busy/10 p-6 text-center text-busy" role="alert">
          ไม่สามารถโหลดข้อมูลช่องจอดได้ กำลังลองใหม่อัตโนมัติ...
        </div>
      ) : isLoading || !spots ? (
        <LoadingSkeleton />
      ) : (
        <>
          <StatsOverview spots={scopedSpots} />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <nav aria-label="เลือกโซน" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
              <div className="inline-flex gap-1 rounded-xl border bg-card p-1">
                {["all", ...zones.keys()].map((z) => (
                  <button
                    key={z}
                    type="button"
                    aria-pressed={zone === z}
                    onClick={() => setZone(z)}
                    className={cn(
                      "h-9 whitespace-nowrap rounded-lg px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      zone === z ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {z === "all" ? "ทุกโซน" : `โซน ${z}`}
                  </button>
                ))}
              </div>
            </nav>

            <div className="flex items-center justify-between gap-4">
              <Legend />
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={freeOnly}
                  onChange={(e) => setFreeOnly(e.target.checked)}
                  className="size-4 accent-[var(--primary)]"
                />
                เฉพาะที่ว่าง
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {visibleZones.map((z) => (
              <ZoneSection key={z} zone={z} spots={zones.get(z) ?? []} freeOnly={freeOnly} onSelect={setSelected} />
            ))}
          </div>
        </>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/85 p-4 backdrop-blur-lg sm:hidden">
        <Button
          className="h-12 w-full text-base"
          disabled={!firstFree}
          onClick={() => firstFree && setSelected(firstFree)}
        >
          <Zap className="size-4" aria-hidden="true" />
          {firstFree ? "จองช่องว่างด่วน" : "ไม่มีช่องว่างในขณะนี้"}
        </Button>
      </div>

      <ReserveDialog
        spot={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onReserved={() => {
          setSelected(null)
          mutate()
        }}
      />
    </div>
  )
}

function LiveIndicator({ updatedAt, error }: { updatedAt: Date | null; error: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs" aria-live="polite">
      <span className="relative flex size-2">
        {!error && <span className="absolute inline-flex size-full animate-ping rounded-full bg-free opacity-75" />}
        <span className={cn("relative inline-flex size-2 rounded-full", error ? "bg-busy" : "bg-free")} />
      </span>
      <span className="hidden text-muted-foreground sm:inline">{error ? "ขาดการเชื่อมต่อ" : "อัปเดตล่าสุด"}</span>
      <span className="font-mono tabular-nums">
        {updatedAt ? updatedAt.toLocaleTimeString("th-TH", { hour12: false }) : "--:--:--"}
      </span>
    </div>
  )
}

function Legend() {
  const tones = { free: "bg-free", busy: "bg-busy", reserved: "bg-reserved" } as const
  return (
    <ul className="flex items-center gap-3 text-sm text-muted-foreground" aria-label="คำอธิบายสี">
      {(Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((key) => (
        <li key={key} className="flex items-center gap-1.5">
          <span className={cn("size-2.5 rounded-full", tones[key])} aria-hidden="true" />
          {STATUS_META[key].label}
        </li>
      ))}
    </ul>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="กำลังโหลด">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[74px] animate-pulse rounded-2xl bg-card" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-card" />
    </div>
  )
}
