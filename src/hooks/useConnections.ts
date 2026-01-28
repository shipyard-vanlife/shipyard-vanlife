import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
    staleTime: 0,
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

// Get all my connections (including pending sent requests)
export function useAllConnections() {
  return useQuery({
    queryKey: [...connectionKeys.all, 'all-status'] as const,
    queryFn: async (): Promise<Connection[]> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`sender_id.eq.${user.user.id},receiver_id.eq.${user.user.id}`)

      if (error) throw error
      return (data as Connection[]) ?? []
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
      // Invalidate all connection-related queries
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
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
      // Invalidate all connection-related queries
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
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
      // Invalidate all connection-related queries
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    },
  })
}

// Check if connection exists with a user
export function useCheckConnection(userId: string) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...connectionKeys.all, 'check', userId],
    queryFn: async (): Promise<Connection | null> => {
      console.log('🔵 Checking connection status for userId:', userId)
      const { data, error } = await supabase.rpc('check_connection_status', {
        p_other_user_id: userId,
      })

      console.log('🔵 check_connection_status response:', { data, error })

      if (error) {
        console.log('🔴 check_connection_status error:', error)
        throw error
      }

      // Si data est un array, prendre le premier élément
      const connection = Array.isArray(data) ? (data.length > 0 ? data[0] : null) : data
      console.log('🔵 Returning connection:', connection)
      return connection as Connection | null
    },
    enabled: !!userId,
    staleTime: 0, // Always refetch
    refetchOnMount: 'always', // Refetch every time component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  })

  // Subscribe to realtime changes on connections table
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`connection-changes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        (payload) => {
          console.log('🟢 Connection change detected:', payload)
          // Invalidate this specific connection check
          queryClient.invalidateQueries({ queryKey: [...connectionKeys.all, 'check', userId] })
          // Also invalidate all connection queries
          queryClient.invalidateQueries({ queryKey: connectionKeys.all })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  return query
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
      // Invalidate all connection-related queries
      await queryClient.invalidateQueries({ queryKey: connectionKeys.all })
    },
  })
}
