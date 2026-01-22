import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { Connection, ConnectionRequest, Friend } from '../types/chat'

// Query keys
export const connectionKeys = {
  all: ['connections'] as const,
  friends: () => [...connectionKeys.all, 'friends'] as const,
  requests: () => [...connectionKeys.all, 'requests'] as const,
}

// Get my friends (accepted connections)
export function useMyFriends() {
  return useQuery({
    queryKey: connectionKeys.friends(),
    queryFn: async (): Promise<Friend[]> => {
      const { data, error } = await supabase.rpc('get_my_friends')
      if (error) throw error
      return (data as Friend[]) ?? []
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

// Get connection requests I received
export function useConnectionRequests() {
  return useQuery({
    queryKey: connectionKeys.requests(),
    queryFn: async (): Promise<ConnectionRequest[]> => {
      const { data, error } = await supabase.rpc('get_connection_requests')
      if (error) throw error
      return (data as ConnectionRequest[]) ?? []
    },
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

// Send a connection request
export function useSendConnectionRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (receiverId: string): Promise<string> => {
      const { data, error } = await supabase.rpc('send_connection_request', {
        p_receiver_id: receiverId,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: async () => {
      // Force refetch instead of just invalidate
      await queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
      await queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
    },
  })
}

// Accept a connection request
export function useAcceptConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const { error } = await supabase.rpc('accept_connection', {
        p_connection_id: connectionId,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      // Force refetch instead of just invalidate
      await queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
      await queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
    },
  })
}

// Reject a connection request
export function useRejectConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const { error } = await supabase.rpc('reject_connection', {
        p_connection_id: connectionId,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      // Force refetch instead of just invalidate
      await queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
      await queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
    },
  })
}

// Check if connection exists with a user
export function useCheckConnection(userId: string) {
  return useQuery({
    queryKey: [...connectionKeys.all, 'check', userId],
    queryFn: async (): Promise<Connection | null> => {
      const { data, error } = await supabase.rpc('check_connection_status', {
        p_other_user_id: userId,
      })
      if (error) throw error
      return data ? (data as Connection) : null
    },
    enabled: !!userId,
  })
}

// Delete a connection (cancel request or remove friend)
export function useDeleteConnection() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (connectionId: string): Promise<void> => {
      const { error } = await supabase.rpc('delete_connection', {
        p_connection_id: connectionId,
      })
      if (error) throw error
    },
    onSuccess: async () => {
      // Force refetch instead of just invalidate
      await queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
      await queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
    },
  })
}
