import { applySensorReading } from "@/lib/parking-store"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const spotId = Number(body?.spotId)
  const sensorKey = process.env.SENSOR_KEY

  if (!sensorKey || body?.key !== sensorKey) {
    return new Response(null, { status: 401 })
  }
  if (!Number.isInteger(spotId) || typeof body?.occupied !== "boolean") {
    return Response.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 })
  }

  applySensorReading(spotId, body.occupied)
  return new Response(null, { status: 200 })
}
