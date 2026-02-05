import type { VerificationStatus } from './verification'

// Skill types - matches DB enum skill_type
export type SkillType =
  | 'mechanic'
  | 'plumbing'
  | 'decoration'
  | 'construction'
  | 'electricity'
  | 'carpentry'
  | 'hiking'
  | 'tech'
  | 'cooking'
  | 'languages'
  | 'photo'

// Legacy alias for backward compatibility
export type SkillBadge = SkillType

// Own profile (with exact location - only visible to owner)
export interface UserProfile {
  id: string
  username: string
  avatar_url: string | null
  van_name: string | null
  van_photo_url: string | null
  // Exact location (private)
  location: {
    latitude: number
    longitude: number
  } | null
  city: string | null
  country: string | null
  skills: SkillType[]
  days_on_road: number
  total_distance_km: number
  connections_count: number
  is_visible: boolean
  trips_visible: boolean
  last_location_update: string | null
  created_at: string
  updated_at: string
  // Profile enhancements
  firstname: string | null
  lastname: string | null
  bio: string | null
  photos: string[]
  // Verification status (sensitive data is in verifications table)
  verification_status: VerificationStatus | null
  // Invitation/sponsorship fields
  invited_by: string | null
  invitation_suspended_until: string | null
  invitation_count: number
  // Username update tracking
  username_last_updated_at: string | null
}

// Profile creation/update payload
export interface ProfileInput {
  username: string
  avatar_url?: string | null
  van_name?: string | null
  van_photo_url?: string | null
  latitude?: number
  longitude?: number
  city?: string
  country?: string | null
  skills?: SkillType[]
  days_on_road?: number
  is_visible?: boolean
  trips_visible?: boolean
  tripName?: string
  // Profile enhancements
  firstname?: string | null
  lastname?: string | null
  bio?: string | null
  photos?: string[]
}

// Database row type (matches Supabase table exactly)
export interface ProfileRow {
  id: string
  username: string
  avatar_url: string | null
  van_name: string | null
  van_photo_url: string | null
  location: string | null // PostGIS geography as string
  city: string | null
  country: string | null
  skills: SkillType[] | null
  days_on_road: number
  total_distance_km: number
  connections_count: number
  is_visible: boolean
  trips_visible: boolean
  last_location_update: string | null
  created_at: string
  updated_at: string
  // Profile enhancements
  firstname: string | null
  lastname: string | null
  bio: string | null
  photos: string[] | null
  // Verification status (sensitive data is in verifications table)
  verification_status: VerificationStatus | null
  // Invitation/sponsorship fields
  invited_by: string | null
  invitation_suspended_until: string | null
}

// Skill colors for UI
export const SKILL_COLORS: Record<SkillType, string> = {
  mechanic: '#E07A5F',
  plumbing: '#81B29A',
  decoration: '#F2CC8F',
  construction: '#D4A373',
  electricity: '#F4A261',
  carpentry: '#8B4513',
  hiking: '#E07A5F',
  tech: '#F4C542',
  cooking: '#D4A373',
  languages: '#3B82F6',
  photo: '#8B7355',
}

// Skill icons for map markers and badges (Ionicons names)
export const SKILL_ICONS: Record<SkillType, string> = {
  mechanic: 'construct',
  plumbing: 'water',
  decoration: 'color-palette',
  construction: 'hammer',
  electricity: 'flash',
  carpentry: 'cut',
  hiking: 'trail-sign',
  tech: 'hardware-chip',
  cooking: 'restaurant',
  languages: 'chatbubbles',
  photo: 'camera',
}

// All available skills (for forms/filters)
export const ALL_SKILLS: SkillType[] = [
  'mechanic',
  'plumbing',
  'decoration',
  'construction',
  'electricity',
  'carpentry',
  'hiking',
  'tech',
  'cooking',
  'languages',
  'photo',
]
