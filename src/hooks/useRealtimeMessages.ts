import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { messageKeys } from './useMessages'
import { helpRequestKeys } from './useHelpRequests'

export function useRealtimeMessages(connectionId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!connectionId) return

    console.log(
      '🔵 Setting up realtime for messages and help requests in connection:',
      connectionId
    )

    const channel = supabase
      .channel(`conversation-${connectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `connection_id=eq.${connectionId}`,
        },
        payload => {
          console.log('🔴 Message change detected:', payload)

          queryClient.refetchQueries({
            queryKey: messageKeys.infinite(connectionId),
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
          filter: `connection_id=eq.${connectionId}`,
        },
        payload => {
          console.log('🔴 Help request change detected:', payload)

          queryClient.refetchQueries({
            queryKey: helpRequestKeys.byConnection(connectionId),
          })
        }
      )
      .subscribe()

    return () => {
      console.log('🔵 Cleaning up realtime for conversation:', connectionId)
      supabase.removeChannel(channel)
    }
  }, [connectionId, queryClient])
}
