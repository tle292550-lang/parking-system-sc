export type SpotStatus = "free" | "busy" | "reserved"

export type Spot = {
  id: number
  zone_id: string
  status: SpotStatus
  updated_at: string
}

export type Reservation = {
  id: number
  spot_id: number
  user_id: string
  start_at: string
  end_at: string
  released?: boolean
}

export function spotLabel(spot: Pick<Spot, "id" | "zone_id">, spotsPerZone = 16) {
  const index = ((spot.id - 1) % spotsPerZone) + 1
  return `${spot.zone_id}${String(index).padStart(2, "0")}`
}
