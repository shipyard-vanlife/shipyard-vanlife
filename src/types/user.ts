// Skill types - matches DB enum skill_type
export type SkillType =
  | 'mechanic'
  | 'plumbing'
  | 'decoration'
  | 'construction'
  | 'electricity'
  | 'carpentry'

// Legacy alias for backward compatibility
export type SkillBadge = SkillType

// Own profile (with exact location - only visible to owner)
export interface UserProfile {
  id: string
  username: string
  van_name: string | null
  van_photo_url: string | null
  // Exact location (private)
  location: {
    latitude: number
    longitude: number
  } | null
  city: string | null
  main_specialty: SkillType | null
  skills: SkillType[]
  days_on_road: number
  connections_count: number
  is_visible: boolean
  last_location_update: string | null
  created_at: string
  updated_at: string
}

// Profile creation/update payload
export interface ProfileInput {
  username: string
  van_name?: string | null
  van_photo_url?: string | null
  city?: string | null
  main_specialty?: SkillType | null
  skills?: SkillType[]
  days_on_road?: number
  is_visible?: boolean
}

// Database row type (matches Supabase table exactly)
export interface ProfileRow {
  id: string
  username: string
  van_name: string | null
  van_photo_url: string | null
  location: string | null // PostGIS geography as string
  city: string | null
  main_specialty: SkillType | null
  skills: SkillType[] | null
  days_on_road: number
  connections_count: number
  is_visible: boolean
  last_location_update: string | null
  created_at: string
  updated_at: string
}

// Skill colors for UI
export const SKILL_COLORS: Record<SkillType, string> = {
  mechanic: '#E07A5F',
  plumbing: '#81B29A',
  decoration: '#F2CC8F',
  construction: '#D4A373',
  electricity: '#F4A261',
  carpentry: '#8B4513',
}

// All available skills (for forms/filters)
export const ALL_SKILLS: SkillType[] = [
  'mechanic',
  'plumbing',
  'decoration',
  'construction',
  'electricity',
  'carpentry',
]
