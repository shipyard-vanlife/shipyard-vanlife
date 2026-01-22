// Connection types
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected'

export interface Connection {
  id: string
  sender_id: string
  receiver_id: string
  status: ConnectionStatus
  created_at: string
  updated_at: string
}

// Friend (connexion acceptée avec infos)
export interface Friend {
  connection_id: string
  friend_id: string
  friend_username: string
  friend_avatar_url: string | null
  last_message: string | null
  last_message_time: string | null
  unread_count: number
  status: string // 'accepted' or 'pending'
}

// Demande de connexion
export interface ConnectionRequest {
  connection_id: string
  sender_id: string
  sender_username: string
  sender_avatar_url: string | null
  created_at: string
}

// Message
export interface Message {
  id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  is_mine: boolean
}

// Input pour créer un message
export interface MessageInput {
  connection_id: string
  content: string
}
