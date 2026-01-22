import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { Message, MessageInput } from '../types/chat'

// Query keys
export const messageKeys = {
  all: ['messages'] as const,
  byConnection: (connectionId: string) => [...messageKeys.all, connectionId] as const,
  conversation: (connectionId: string) => [...messageKeys.all, connectionId] as const, // Alias for compatibility
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
      // Refresh messages for this conversation
      queryClient.invalidateQueries({
        queryKey: messageKeys.conversation(variables.connection_id),
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
      // Refresh messages for this conversation AND friends list
      queryClient.refetchQueries({
        queryKey: messageKeys.conversation(connectionId),
      })
      queryClient.refetchQueries({
        queryKey: ['connections', 'friends'],
      })
    },
  })
}
