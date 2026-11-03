import type { Reservation, Spot, SpotStatus } from "./types"

const ZONES = ["A", "B", "C"] as const
const SPOTS_PER_ZONE = 16
const SENSOR_TICK_MS = 3000

type Store = {
  spots: Spot[]
  reservations: Reservation[]
  lastSensorTick: number
  nextReservationId: number
}

function seed(): Store {
  const spots: Spot[] = []
  let id = 1
  for (const zone of ZONES) {
    for (let i = 0; i < SPOTS_PER_ZONE; i++) {
      const roll = Math.random()
      const status: SpotStatus = roll < 0.45 ? "free" : roll < 0.88 ? "busy" : "reserved"
      spots.push({ id: id++, zone_id: zone, status, updated_at: new Date().toISOString() })
    }
  }
  return { spots, reservations: [], lastSensorTick: Date.now(), nextReservationId: 1 }
}

const globalForStore = globalThis as unknown as { parkingStore?: Store }
const store = (globalForStore.parkingStore ??= seed())

function setStatus(spot: Spot, status: SpotStatus) {
  spot.status = status
  spot.updated_at = new Date().toISOString()
}

function releaseExpiredReservations(now: number) {
  for (const r of store.reservations) {
    if (r.released || new Date(r.end_at).getTime() > now) continue
    r.released = true
    const spot = store.spots.find((s) => s.id === r.spot_id)
    if (spot?.status === "reserved") setStatus(spot, "free")
  }
}

// Stands in for real sensors posting to /api/sensor so the demo feels live.
function simulateSensors(now: number) {
  if (now - store.lastSensorTick < SENSOR_TICK_MS) return
  store.lastSensorTick = now
  const candidates = store.spots.filter((s) => s.status !== "reserved")
  const flips = 1 + Math.floor(Math.random() * 3)
  for (let i = 0; i < flips; i++) {
    const spot = candidates[Math.floor(Math.random() * candidates.length)]
    if (spot) setStatus(spot, spot.status === "free" ? "busy" : "free")
  }
}

export function getSpots(): Spot[] {
  const now = Date.now()
  releaseExpiredReservations(now)
  simulateSensors(now)
  return store.spots.map((s) => ({ ...s }))
}

export function applySensorReading(spotId: number, occupied: boolean) {
  const spot = store.spots.find((s) => s.id === spotId)
  if (!spot || spot.status === "reserved") return false
  setStatus(spot, occupied ? "busy" : "free")
  return true
}

export function reserveSpot(input: {
  spotId: number
  userId: string
  startAt: string
  endAt: string
}): { ok: true; reservation: Reservation } | { ok: false } {
  const spot = store.spots.find((s) => s.id === input.spotId)
  if (!spot || spot.status !== "free") return { ok: false }
  setStatus(spot, "reserved")
  const reservation: Reservation = {
    id: store.nextReservationId++,
    spot_id: input.spotId,
    user_id: input.userId,
    start_at: input.startAt,
    end_at: input.endAt,
  }
  store.reservations.push(reservation)
  return { ok: true, reservation }
}
