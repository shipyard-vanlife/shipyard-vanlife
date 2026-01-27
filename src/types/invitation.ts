// Invitation code record from database
export interface InvitationCode {
  id: string
  code: string
  created_at: string
  used_by_id: string | null
  used_by_username: string | null
  used_at: string | null
}

// Input for using an invitation code
export interface UseInvitationCodeInput {
  code: string
}

// Response from generate_invitation_code RPC
export type GenerateInvitationCodeResponse = string

// Response from use_invitation_code RPC
export type UseInvitationCodeResponse = boolean

// Invitation stats for a user
export interface InvitationStats {
  // Number of approved invitees
  count: number
  // Whether user can generate codes (verified + not suspended)
  canGenerate: boolean
  // If suspended, when it ends
  suspendedUntil: string | null
}
