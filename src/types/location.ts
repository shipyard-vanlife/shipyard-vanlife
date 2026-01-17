// Exact coordinates (private - only for own profile)
export interface Coordinates {
  latitude: number
  longitude: number
}

// Blurred zone center (public - what others see)
export interface ZoneCenter {
  latitude: number // Rounded to 0.1 (~11km precision)
  longitude: number
}

// Map viewport bounds
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// Zone displayed on map
export interface MapZone {
  center: ZoneCenter
  count: number // Number of vans in this zone
  profiles?: NearbyProfile[] // Loaded when zone is tapped
}

// Profile as returned by get_nearby_profiles function
export interface NearbyProfile {
  id: string
  username: string
  van_name: string | null
  van_photo_url: string | null
  zone_center: ZoneCenter | null
  city: string | null
  main_specialty: import('./user').SkillType | null
  skills: import('./user').SkillType[]
  days_on_road: number
  distance_km: number | null
  last_location_update: string | null
}

// Parameters for nearby profiles query
export interface NearbyProfilesParams {
  latitude: number
  longitude: number
  radiusKm?: number
}

// Parameters for zone profiles query
export interface ZoneProfilesParams {
  zoneLat: number
  zoneLng: number
  userLat?: number
  userLng?: number
}
