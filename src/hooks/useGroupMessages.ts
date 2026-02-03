import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../services/supabase'

// Types
export interface GroupConversation {
  id: string
  activity_id: string
  name: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  member_count: number
  created_at: string
}

export interface GroupMessage {
  id: string
  group_id: string
  sender_id: string
  sender_username: string
  sender_avatar: string | null
  content: string
  created_at: string
}

// Query keys
export const groupKeys = {
  all: ['groups'] as const,
  conversations: () => [...groupKeys.all, 'conversations'] as const,
  messages: (groupId: string) => [...groupKeys.all, 'messages', groupId] as const,
}

// ============================================
// GET MY GROUP CONVERSATIONS
// ============================================

export function useMyGroupConversations() {
  const queryClient = useQueryClient()
  const {
    data: session,
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

  const query = useQuery({
    queryKey: groupKeys.conversations(),
    queryFn: async (): Promise<GroupConversation[]> => {
      const { data, error } = await supabase.rpc('get_my_group_conversations')

      if (error) throw error
      return (data as GroupConversation[]) ?? []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`group-conversations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: groupKeys.conversations() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_conversation_members',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: groupKeys.conversations() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  return query
}

// ============================================
// GET GROUP MESSAGES
// ============================================

export function useGroupMessages(groupId: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: groupId ? groupKeys.messages(groupId) : ['disabled'],
    queryFn: async (): Promise<GroupMessage[]> => {
      if (!groupId) return []

      const { data, error } = await supabase.rpc('get_group_messages', {
        p_group_id: groupId,
      })

      if (error) throw error
      return (data as GroupMessage[]) ?? []
    },
    enabled: !!groupId,
    staleTime: 1000 * 60, // 1 minute
  })

  // Realtime subscription for messages
  useEffect(() => {
    if (!groupId) return

    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: groupKeys.messages(groupId) })
          queryClient.invalidateQueries({ queryKey: groupKeys.conversations() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, queryClient])

  return query
}

// ============================================
// SEND GROUP MESSAGE
// ============================================

export function useSendGroupMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      groupId,
      content,
    }: {
      groupId: string
      content: string
    }): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('group_messages').insert({
        group_id: groupId,
        sender_id: user.id,
        content,
      })

      if (error) throw error
    },
    onSuccess: (_, { groupId }) => {
      queryClient.invalidateQueries({ queryKey: groupKeys.messages(groupId) })
      queryClient.invalidateQueries({ queryKey: groupKeys.conversations() })
    },
  })
}

// ============================================
// GET GROUP BY ACTIVITY ID
// ============================================

export function useGroupByActivityId(activityId: string | null) {
  return useQuery({
    queryKey: activityId ? ['group', 'activity', activityId] : ['disabled'],
    queryFn: async (): Promise<GroupConversation | null> => {
      if (!activityId) return null

      const { data, error } = await supabase
        .from('group_conversations')
        .select('*')
        .eq('activity_id', activityId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as GroupConversation
    },
    enabled: !!activityId,
  })
}
