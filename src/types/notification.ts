export type NotificationType =
  | 'message'
  | 'connection_request'
  | 'connection_accepted'
  | 'activity_invitation'
  | 'activity_message'
  | 'activity_joined'
  | 'activity_cancelled'
  | 'help_request'
  | 'help_response'
  | 'invitation_response'
  | 'invitation_code_used'
  | 'verification_status'

export interface NotificationNavigationData {
  screen?: 'chat' | 'activityChat' | 'activities' | 'connections' | 'profile'
  connectionId?: string
  activityId?: string
  userId?: string
}

export interface AppNotification {
  id: string
  user_id: string
  type: NotificationType
  actor_id: string | null
  related_id: string | null
  title_key: string
  body_key: string
  body_params: Record<string, string>
  data: NotificationNavigationData
  read_at: string | null
  created_at: string
  actor_username?: string
  actor_avatar_url?: string | null
}
