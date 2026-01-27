import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { connectionKeys } from './useConnections'

export function useRealtimeConnections() {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('🔵 Setting up realtime for connections, messages, and help requests')

    const channel = supabase
      .channel('connections-and-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        payload => {
          console.log('🔴 Changement détecté dans connections:', payload)

          queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
          queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          console.log('🔴 Nouveau message détecté:', payload)

          queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_requests',
        },
        (payload) => {
          console.log('🔴 Help request détecté:', payload)

          queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
        }
      )
      .subscribe()

    return () => {
      console.log('🔵 Cleaning up realtime for connections, messages, and help requests')
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
