import { Coordinates } from './location'

export type ActivityType = 'outdoor' | 'food' | 'skills' | 'social' | 'sport' | 'culture' | 'other'

export type ActivityVisibility = 'public' | 'friends' | 'private'

export type ActivityStatus = 'open' | 'full' | 'cancelled' | 'finished'

export type ParticipantStatus = 'pending' | 'accepted' | 'declined'

// Activity as stored in database
export interface Activity {
  id: string
  creator_id: string
  creator_username?: string
  creator_avatar?: string | null
  title: string
  description: string | null
  activity_type: ActivityType
  location: Coordinates
  location_name: string
  start_date: string // ISO timestamp
  end_date: string | null // ISO timestamp
  max_participants: number | null // null = unlimited
  current_participants?: number
  visibility: ActivityVisibility
  status: ActivityStatus
  distance_km?: number | null // Calculated by get_nearby_activities
  is_participant?: boolean // Am I participating?
  is_creator?: boolean // Did I create it?
  created_at: string
  updated_at?: string
}

// Activity participant
export interface ActivityParticipant {
  id: string
  activity_id: string
  user_id: string
  username?: string
  avatar_url?: string | null
  status: ParticipantStatus
  joined_at: string
}

// Activity invitation
export interface ActivityInvitation {
  id: string
  activity_id: string
  inviter_id: string
  invitee_id: string
  inviter_username?: string
  inviter_avatar?: string | null
  activity_title?: string
  activity_type?: ActivityType
  activity_start_date?: string
  activity_location_name?: string
  message: string | null
  status: ParticipantStatus
  invited_at: string
  responded_at: string | null
}

// Input for creating an activity
export interface CreateActivityInput {
  title: string
  description?: string
  activity_type: ActivityType
  latitude: number
  longitude: number
  location_name: string
  start_date: string // ISO timestamp
  end_date?: string // ISO timestamp
  max_participants?: number // undefined = unlimited
  visibility?: ActivityVisibility
}

// Input for updating an activity
export interface UpdateActivityInput {
  title?: string
  description?: string
  activity_type?: ActivityType
  location_name?: string
  start_date?: string
  end_date?: string
  max_participants?: number
  visibility?: ActivityVisibility
  status?: ActivityStatus
}

// Activity with full details including participants
export interface ActivityWithParticipants extends Activity {
  participants: ActivityParticipant[]
}

// Activity type icons mapping
export const ACTIVITY_TYPE_ICONS: Record<ActivityType, string> = {
  outdoor: 'mountain',
  food: 'restaurant',
  skills: 'hammer',
  social: 'people',
  sport: 'fitness',
  culture: 'library',
  other: 'ellipsis-horizontal',
}

// Activity type colors
export const ACTIVITY_TYPE_COLORS: Record<ActivityType, string> = {
  outdoor: '#4CAF50',
  food: '#FF9800',
  skills: '#E07A5F',
  social: '#9C27B0',
  sport: '#2196F3',
  culture: '#795548',
  other: '#666666',
}
