import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { connectionKeys } from './useConnections'

export function useRealtimeConnections() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('connections-and-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: connectionKeys.friends() })
          queryClient.invalidateQueries({ queryKey: connectionKeys.requests() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: connectionKeys.friends() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: connectionKeys.friends() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
