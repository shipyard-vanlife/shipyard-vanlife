export interface ActivityMessage {
  id: string
  activity_id: string
  sender_id: string
  sender_username: string
  sender_avatar: string | null
  content: string
  created_at: string
  is_mine: boolean
}

export interface ActivityChat {
  id: string
  activity_id: string
  created_at: string
}

export interface ActivityChatPreview {
  activity_id: string
  activity_title: string
  activity_type: string
  last_message: string | null
  last_message_time: string | null
  unread_count: number
}

export interface SendActivityMessageInput {
  activity_id: string
  content: string
}
