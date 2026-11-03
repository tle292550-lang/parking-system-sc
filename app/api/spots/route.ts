import { getSpots } from "@/lib/parking-store"

export const dynamic = "force-dynamic"

export function GET() {
  return Response.json(getSpots())
}
