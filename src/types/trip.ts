// Stage photo
export interface StagePhoto {
  id: string
  photo_url: string
  photo_order: number
  created_at: string
}

// Trip stage - a waypoint in a trip
export interface TripStage {
  id: string
  location: {
    latitude: number
    longitude: number
  }
  city: string | null
  country: string | null // ISO 3166-1 alpha-2 code (e.g., "FR", "ES")
  arrived_at: string
  stage_order: number
  note: string | null
}

// Trip - a journey with multiple stages (own trips with EXACT coordinates)
export interface Trip {
  id: string
  name: string
  start_date: string
  end_date: string | null
  is_active: boolean
  days_count: number
  stages_count: number
  total_distance_km: number
  created_at: string
  stages: TripStage[]
}

// Public trip stage - for viewing OTHER users' trips (BLURRED coordinates)
export interface PublicTripStage {
  id: string
  location: {
    latitude: number // BLURRED (~11km precision)
    longitude: number // BLURRED (~11km precision)
  }
  city: string | null
  country: string | null
  arrived_at: string
  stage_order: number
  note: null // Notes are private, always null for other users
}

// Public trip - for viewing OTHER users' trips (BLURRED coordinates, no private data)
export interface PublicTrip {
  id: string
  name: string
  start_date: string
  end_date: string | null
  is_active: boolean
  days_count: number
  stages_count: number
  total_distance_km: number
  created_at: string
  stages: PublicTripStage[]
}

// Trip creation payload
export interface CreateTripInput {
  name: string
  latitude: number
  longitude: number
  city?: string | null
  country?: string | null // ISO 3166-1 alpha-2 code
}

// Add stage payload
export interface AddStageInput {
  latitude: number
  longitude: number
  city?: string | null
  country?: string | null // ISO 3166-1 alpha-2 code
}

// Database row types (matches Supabase tables exactly)
export interface TripRow {
  id: string
  user_id: string
  name: string
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
}

export interface TripStageRow {
  id: string
  trip_id: string
  location: string // PostGIS geography as string
  city: string | null
  country: string | null // ISO 3166-1 alpha-2 code
  arrived_at: string
  stage_order: number
  note: string | null
  created_at: string
}

// Update stage note payload
export interface UpdateStageNoteInput {
  stageId: string
  note: string
}
