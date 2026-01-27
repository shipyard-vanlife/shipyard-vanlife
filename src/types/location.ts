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

// Profile as returned by get_nearby_profiles, get_all_visible_profiles, get_profiles_in_zone
// These functions return BLURRED coordinates (zone_center) for privacy
export interface NearbyProfile {
  id: string
  username: string
  avatar_url: string | null
  van_name: string | null
  van_photo_url: string | null
  zone_center: ZoneCenter | null // BLURRED coordinates (~11km precision)
  city: string | null
  skills: import('./user').SkillType[]
  days_on_road: number
  distance_km: number | null
  last_location_update: string | null
  firstname: string | null
  lastname: string | null
  connections_count?: number // Only returned by get_all_visible_profiles
}

// Full profile of another user (returned by get_profile_by_id, get_user_profile)
// Location is BLURRED for privacy (zone_center)
export interface PublicProfile {
  id: string
  username: string
  avatar_url: string | null
  van_name: string | null
  van_photo_url: string | null
  zone_center: ZoneCenter | null // BLURRED coordinates (~11km precision)
  city: string | null
  skills: import('./user').SkillType[]
  days_on_road: number
  total_distance_km: number
  connections_count: number
  is_visible: boolean
  created_at: string
  updated_at?: string
  firstname: string | null
  lastname: string | null
  bio: string | null
  photos: string[]
  verification_status: import('./verification').VerificationStatus | null
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
