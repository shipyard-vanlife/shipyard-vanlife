import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { Message, MessageInput } from '../types/chat'

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  byConnection: (connectionId: string) => [...messageKeys.all, connectionId] as const,
  conversation: (connectionId: string) => [...messageKeys.all, connectionId] as const, // Alias for compatibility
  infinite: (connectionId: string) => [...messageKeys.all, 'infinite', connectionId] as const,
}

// Get messages for a conversation
export function useMessages(connectionId: string) {
  return useQuery({
    queryKey: messageKeys.conversation(connectionId),
    queryFn: async (): Promise<Message[]> => {
      const { data, error } = await supabase.rpc('get_messages', {
        p_connection_id: connectionId,
      })
      if (error) throw error
      return (data as Message[]) ?? []
    },
    enabled: !!connectionId,
  })
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: MessageInput): Promise<string> => {
      const { data, error } = await supabase.rpc('send_message', {
        p_connection_id: input.connection_id,
        p_content: input.content,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: messageKeys.infinite(variables.connection_id),
      })
    },
  })
}

// Mark messages as read
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const { error } = await supabase.rpc('mark_messages_as_read', {
        p_connection_id: connectionId,
      })
      if (error) throw error
    },
    onSuccess: (_, connectionId) => {
      queryClient.refetchQueries({
        queryKey: messageKeys.conversation(connectionId),
      })
      queryClient.refetchQueries({
        queryKey: ['connections', 'friends'],
      })
    },
  })
}

const MESSAGES_PER_PAGE = 50

export function useInfiniteMessages(connectionId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.infinite(connectionId),
    queryFn: async ({ pageParam = 0 }): Promise<Message[]> => {
      const { data, error } = await supabase.rpc('get_messages_paginated', {
        p_connection_id: connectionId,
        p_limit: MESSAGES_PER_PAGE,
        p_offset: pageParam * MESSAGES_PER_PAGE,
      })

      if (error) throw error
      return (data as Message[]) ?? []
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MESSAGES_PER_PAGE) {
        return undefined
      }
      return allPages.length
    },
    initialPageParam: 0,
    enabled: !!connectionId,
  })
}
