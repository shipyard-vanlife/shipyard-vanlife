import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { connectionKeys } from './useConnections'

export function useRealtimeConnections() {
  const queryClient = useQueryClient()

  useEffect(() => {
    console.log('🔵 Setting up realtime for connections AND messages')

    const channel = supabase
      .channel('connections-and-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'connections',
        },
        payload => {
          console.log('🔴 Changement détecté dans connections:', payload)

          // Force refetch pour mettre à jour immédiatement
          queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
          queryClient.refetchQueries({ queryKey: connectionKeys.requests() })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'messages',
        },
        payload => {
          console.log('🔴 Nouveau message détecté:', payload)

          // Refetch la liste des amis pour mettre à jour le dernier message et le compteur
          queryClient.refetchQueries({ queryKey: connectionKeys.friends() })
        }
      )
      .subscribe()

    return () => {
      console.log('🔵 Cleaning up realtime for connections and messages')
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
