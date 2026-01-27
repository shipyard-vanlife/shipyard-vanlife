import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import { messageKeys } from './useMessages'

/**
 * Hook pour écouter les changements en temps réel sur les messages d'une conversation
 * @param connectionId - L'ID de la connexion (conversation) à surveiller
 */
export function useRealtimeMessages(connectionId: string | null) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!connectionId) return

    console.log('🔵 Setting up realtime for messages in connection:', connectionId)

    const channel = supabase
      .channel(`messages-${connectionId}`)
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
      .subscribe()

    return () => {
      console.log('🔵 Cleaning up realtime for messages in connection:', connectionId)
      supabase.removeChannel(channel)
    }
  }, [connectionId, queryClient])
}
