"use client"

import { useState } from "react"
import { Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { spotLabel, type Spot } from "@/lib/types"

const DURATIONS = [1, 2, 3, 4] as const

function toLocalInputValue(date: Date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

export function ReserveDialog({
  spot,
  onOpenChange,
  onReserved,
}: {
  spot: Spot | null
  onOpenChange: (open: boolean) => void
  onReserved: () => void
}) {
  return (
    <Dialog open={spot !== null} onOpenChange={onOpenChange}>
      <DialogContent className="gap-5 p-5 sm:max-w-md">
        {spot && <ReserveForm key={spot.id} spot={spot} onDone={onReserved} />}
      </DialogContent>
    </Dialog>
  )
}

function ReserveForm({ spot, onDone }: { spot: Spot; onDone: () => void }) {
  const [userId, setUserId] = useState("")
  const [startAt, setStartAt] = useState(() => toLocalInputValue(new Date()))
  const [hours, setHours] = useState<number>(2)
  const [submitting, setSubmitting] = useState(false)
  const label = spotLabel(spot)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const start = new Date(startAt)
    const end = new Date(start.getTime() + hours * 3600000)
    setSubmitting(true)
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: spot.id,
          userId,
          startAt: start.toISOString(),
          endAt: end.toISOString(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error ?? "จองไม่สำเร็จ ลองใหม่อีกครั้ง")
        onDone()
        return
      }
      toast.success(`จองช่อง ${label} สำเร็จ`, {
        description: `${start.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.`,
      })
      onDone()
    } catch {
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <DialogHeader className="flex-row items-center gap-3 text-left">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-free/15 font-mono text-base font-bold text-free">
          {label}
        </span>
        <div className="flex flex-col gap-1">
          <DialogTitle className="text-lg">จองช่องจอด {label}</DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden="true" /> โซน {spot.zone_id} · ว่างพร้อมใช้งาน
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="flex flex-col gap-2">
        <Label htmlFor="userId">ชื่อหรือทะเบียนรถ</Label>
        <Input
          id="userId"
          required
          maxLength={40}
          autoComplete="off"
          placeholder="เช่น กข 1234"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="h-11"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="startAt">เวลาเริ่ม</Label>
        <Input
          id="startAt"
          type="datetime-local"
          required
          value={startAt}
          onChange={(e) => setStartAt(e.target.value)}
          className="h-11 [color-scheme:dark]"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">ระยะเวลา</legend>
        <div className="grid grid-cols-4 gap-2">
          {DURATIONS.map((h) => (
            <button
              key={h}
              type="button"
              aria-pressed={hours === h}
              onClick={() => setHours(h)}
              className={cn(
                "h-11 rounded-lg border text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                hours === h
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-accent",
              )}
            >
              {h} ชม.
            </button>
          ))}
        </div>
      </fieldset>

      <DialogFooter className="-mx-5 -mb-5 mt-1 rounded-b-xl border-t bg-muted/40 p-5">
        <Button type="submit" disabled={submitting} className="h-11 w-full text-base">
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? "กำลังจอง..." : "ยืนยันการจอง"}
        </Button>
      </DialogFooter>
    </form>
  )
}
