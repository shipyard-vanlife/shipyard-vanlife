import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { messageKeys } from './useMessages'
import { helpRequestKeys } from './useHelpRequests'

export function useRealtimeMessages(connectionId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!connectionId) return

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
        () => {
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
        () => {
          queryClient.refetchQueries({
            queryKey: helpRequestKeys.byConnection(connectionId),
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [connectionId, queryClient])
}
