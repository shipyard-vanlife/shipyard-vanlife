import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import type {
  ActivityMessage,
  SendActivityMessageInput,
  ActivityChatPreview,
} from '../types/activityChat'

// Query keys
export const activityChatKeys = {
  all: ['activityChat'] as const,
  messages: (activityId: string) => [...activityChatKeys.all, 'messages', activityId] as const,
  chat: (activityId: string) => [...activityChatKeys.all, 'chat', activityId] as const,
  myChats: () => [...activityChatKeys.all, 'myChats'] as const,
}

// ============================================
// ENSURE ACTIVITY CHAT EXISTS
// ============================================

export function useEnsureActivityChat(activityId: string | null) {
  return useQuery({
    queryKey: activityId ? activityChatKeys.chat(activityId) : ['disabled'],
    queryFn: async (): Promise<string | null> => {
      if (!activityId) return null

      const { data, error } = await supabase.rpc('ensure_activity_chat', {
        p_activity_id: activityId,
      })

      if (error) throw error
      return data as string
    },
    enabled: !!activityId,
    staleTime: Infinity, // Chat ID ne change jamais
  })
}

// ============================================
// GET ACTIVITY MESSAGES
// ============================================

export function useActivityMessages(activityId: string | null) {
  return useQuery({
    queryKey: activityId ? activityChatKeys.messages(activityId) : ['disabled'],
    queryFn: async (): Promise<ActivityMessage[]> => {
      if (!activityId) return []

      const { data, error } = await supabase.rpc('get_activity_messages', {
        p_activity_id: activityId,
      })

      if (error) throw error
      return (data as ActivityMessage[]) ?? []
    },
    enabled: !!activityId,
    staleTime: 1000 * 10, // 10 seconds
  })
}

// ============================================
// SEND ACTIVITY MESSAGE
// ============================================

export function useSendActivityMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: SendActivityMessageInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('activity_messages').insert({
        activity_id: input.activity_id,
        sender_id: user.id,
        content: input.content,
      })

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: activityChatKeys.messages(variables.activity_id),
      })
    },
  })
}

// ============================================
// REALTIME SUBSCRIPTION
// ============================================

export function useRealtimeActivityMessages(activityId: string | null) {
  const queryClient = useQueryClient()
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    },
  })

  const userId = session?.user?.id

  useEffect(() => {
    if (!activityId || !userId) return

    const channel = supabase
      .channel(`activity-chat-${activityId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_messages',
          filter: `activity_id=eq.${activityId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: activityChatKeys.messages(activityId),
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activityId, userId, queryClient])
}

// ============================================
// GET MY ACTIVITY CHATS (for ChatScreen list)
// ============================================

export function useMyActivityChats() {
  return useQuery({
    queryKey: activityChatKeys.myChats(),
    queryFn: async (): Promise<ActivityChatPreview[]> => {
      const { data, error } = await supabase.rpc('get_my_activity_chats')

      if (error) throw error
      return (data as ActivityChatPreview[]) ?? []
    },
    staleTime: 1000 * 30, // 30 seconds
  })
}
