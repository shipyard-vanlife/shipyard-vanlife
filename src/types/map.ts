import type { Trip } from './trip'

// Stage data for map overlay
export interface TripOverlayStage {
  id: string
  latitude: number
  longitude: number
  city: string | null
  country: string | null
  arrivedAt: string
  stageOrder: number
  note: string | null
}

// Trip overlay data for displaying on map
export interface TripOverlayData {
  tripId: string
  tripName: string
  stages: TripOverlayStage[]
  totalDistanceKm: number
  stagesCount: number
}

// Helper function to convert Trip to TripOverlayData
export function tripToOverlayData(trip: Trip): TripOverlayData {
  return {
    tripId: trip.id,
    tripName: trip.name,
    stages: trip.stages.map(s => ({
      id: s.id,
      latitude: s.location.latitude,
      longitude: s.location.longitude,
      city: s.city,
      country: s.country,
      arrivedAt: s.arrived_at,
      stageOrder: s.stage_order,
      note: s.note,
    })),
    totalDistanceKm: trip.total_distance_km,
    stagesCount: trip.stages_count,
  }
}
