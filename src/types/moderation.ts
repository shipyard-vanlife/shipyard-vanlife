/**
 * Types for the moderation system (reports and blocked users)
 */

export type ReportReason = 'inappropriate' | 'fake' | 'harassment' | 'spam' | 'other'

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken'

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: ReportReason
  details: string | null
  status: ReportStatus
  created_at: string
  reviewed_at: string | null
  reviewed_by: string | null
}

export interface BlockedUser {
  id: string
  blocked_user_id: string
  username: string
  avatar_url: string | null
  created_at: string
}

export interface ReportUserParams {
  userId: string
  reason: ReportReason
  details?: string
}
