import { reserveSpot } from "@/lib/parking-store"

const MAX_DURATION_MS = 12 * 60 * 60 * 1000

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const spotId = Number(body?.spotId)
  const userId = typeof body?.userId === "string" ? body.userId.trim().slice(0, 40) : ""
  const start = new Date(body?.startAt)
  const end = new Date(body?.endAt)

  if (!Number.isInteger(spotId) || !userId) {
    return Response.json({ error: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
  }
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start ||
    end.getTime() - start.getTime() > MAX_DURATION_MS
  ) {
    return Response.json({ error: "ช่วงเวลาไม่ถูกต้อง" }, { status: 400 })
  }

  const result = reserveSpot({
    spotId,
    userId,
    startAt: start.toISOString(),
    endAt: end.toISOString(),
  })
  if (!result.ok) return Response.json({ error: "ช่องนี้ไม่ว่าง" }, { status: 409 })

  return Response.json({ ok: true })
}
