import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { BlockedUser, ReportUserParams } from '../types/moderation'
import { profileKeys } from './useProfiles'
import { connectionKeys } from './useConnections'

// Query keys for moderation
export const moderationKeys = {
  all: ['moderation'] as const,
  blocked: () => [...moderationKeys.all, 'blocked'] as const,
  isBlocked: (userId: string) => [...moderationKeys.all, 'isBlocked', userId] as const,
}

/**
 * Report a user for inappropriate behavior
 */
export function useReportUser() {
  return useMutation({
    mutationFn: async ({ userId, reason, details }: ReportUserParams): Promise<string> => {
      const { data, error } = await supabase.rpc('report_user', {
        p_reported_user_id: userId,
        p_reason: reason,
        p_details: details ?? null,
      })
      if (error) throw error
      return data as string
    },
  })
}

/**
 * Block a user - they won't appear on your map and you can't communicate
 */
export function useBlockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('block_user', {
        p_blocked_user_id: userId,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: async (_, blockedUserId) => {
      // Invalidate visible profiles to remove blocked user from map
      await queryClient.invalidateQueries({ queryKey: profileKeys.allVisible() })
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      // Invalidate connections as blocking removes the connection
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
      // Invalidate blocked users list
      await queryClient.invalidateQueries({ queryKey: moderationKeys.blocked() })
      // Update the isBlocked cache for this user
      queryClient.setQueryData(moderationKeys.isBlocked(blockedUserId), true)
    },
  })
}

/**
 * Unblock a user
 */
export function useUnblockUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      const { error } = await supabase.rpc('unblock_user', {
        p_blocked_user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: async (_, unblockedUserId) => {
      // Invalidate visible profiles so unblocked user can appear again
      await queryClient.invalidateQueries({ queryKey: profileKeys.allVisible() })
      await queryClient.invalidateQueries({ queryKey: profileKeys.all })
      // Invalidate blocked users list
      await queryClient.invalidateQueries({ queryKey: moderationKeys.blocked() })
      // Update the isBlocked cache for this user
      queryClient.setQueryData(moderationKeys.isBlocked(unblockedUserId), false)
    },
  })
}

/**
 * Get list of users you have blocked
 */
export function useBlockedUsers() {
  return useQuery({
    queryKey: moderationKeys.blocked(),
    queryFn: async (): Promise<BlockedUser[]> => {
      const { data, error } = await supabase.rpc('get_blocked_users')
      if (error) throw error
      return (data as BlockedUser[]) ?? []
    },
  })
}

/**
 * Check if a user is blocked (mutual - either you blocked them or they blocked you)
 */
export function useIsUserBlocked(userId: string | undefined) {
  return useQuery({
    queryKey: userId ? moderationKeys.isBlocked(userId) : ['disabled'],
    queryFn: async (): Promise<boolean> => {
      if (!userId) return false
      const { data, error } = await supabase.rpc('is_user_blocked', {
        p_user_id: userId,
      })
      if (error) throw error
      return data as boolean
    },
    enabled: !!userId,
    staleTime: 30000, // Cache for 30 seconds
  })
}
