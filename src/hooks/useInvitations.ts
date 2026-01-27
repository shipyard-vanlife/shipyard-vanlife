import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { InvitationCode } from '../types/invitation'
import { profileKeys } from './useProfiles'

// Query keys for invitation-related queries
export const invitationKeys = {
  all: ['invitations'] as const,
  myCodes: () => [...invitationKeys.all, 'myCodes'] as const,
  count: (userId?: string) => [...invitationKeys.all, 'count', userId] as const,
}

// ============================================
// GET MY INVITATION CODES
// ============================================

export function useMyInvitationCodes() {
  return useQuery({
    queryKey: invitationKeys.myCodes(),
    queryFn: async (): Promise<InvitationCode[]> => {
      const { data, error } = await supabase.rpc('get_my_invitation_codes')

      if (error) throw error
      return (data as InvitationCode[]) ?? []
    },
  })
}

// ============================================
// GET INVITATION COUNT
// ============================================

export function useInvitationCount(userId?: string) {
  return useQuery({
    queryKey: invitationKeys.count(userId),
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('get_invitation_count', {
        p_user_id: userId ?? null,
      })

      if (error) throw error
      return (data as number) ?? 0
    },
    enabled: true, // Always enabled, uses current user if no userId provided
  })
}

// ============================================
// GENERATE INVITATION CODE
// ============================================

export function useGenerateInvitationCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<string> => {
      const { data, error } = await supabase.rpc('generate_invitation_code')

      if (error) {
        // Parse specific error messages
        if (error.message.includes('Must be verified')) {
          throw new Error('VERIFICATION_REQUIRED')
        }
        if (error.message.includes('suspended')) {
          throw new Error('INVITATION_SUSPENDED')
        }
        throw error
      }

      return data as string
    },
    onSuccess: () => {
      // Invalidate the codes list to show the new code
      queryClient.invalidateQueries({ queryKey: invitationKeys.myCodes() })
    },
  })
}

// ============================================
// USE INVITATION CODE (for new users)
// ============================================

export function useUseInvitationCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (code: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('use_invitation_code', {
        p_code: code.toUpperCase().trim(),
      })

      if (error) {
        // Parse specific error messages
        if (error.message.includes('Invalid invitation code')) {
          throw new Error('INVALID_CODE')
        }
        if (error.message.includes('already been used')) {
          throw new Error('CODE_ALREADY_USED')
        }
        if (error.message.includes('Cannot use your own')) {
          throw new Error('OWN_CODE')
        }
        throw error
      }

      return data as boolean
    },
    onSuccess: () => {
      // Invalidate profile to get updated invited_by field
      queryClient.invalidateQueries({ queryKey: profileKeys.my() })
    },
  })
}

// ============================================
// VALIDATE INVITATION CODE (check without using)
// ============================================

export function useValidateInvitationCode() {
  return useMutation({
    mutationFn: async (code: string): Promise<boolean> => {
      // Normalize code
      const normalizedCode = code.toUpperCase().trim()

      // Check if code exists and is unused
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('id, used_by_id')
        .eq('code', normalizedCode)
        .maybeSingle()

      if (error) throw error

      // Code doesn't exist
      if (!data) {
        throw new Error('INVALID_CODE')
      }

      // Code already used
      if (data.used_by_id) {
        throw new Error('CODE_ALREADY_USED')
      }

      return true
    },
  })
}
