import { useEffect, useRef } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

/**
 * Configuration for realtime subscription.
 */
interface RealtimeSubscriptionConfig<T extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique channel name for this subscription */
  channelName: string
  /** Database table to listen to */
  table: string
  /** Database schema (default: 'public') */
  schema?: string
  /** Filter string (e.g., 'connection_id=eq.123') */
  filter?: string
  /** Event type to listen for (default: '*' for all events) */
  event?: PostgresChangeEvent
  /** Callback when payload is received */
  onPayload?: (payload: RealtimePostgresChangesPayload<T>) => void
  /** Query keys to invalidate when changes are received */
  invalidateKeys?: QueryKey[]
  /** Whether the subscription is enabled (default: true) */
  enabled?: boolean
}

/**
 * Hook for subscribing to Supabase realtime database changes.
 *
 * Standardizes the realtime subscription pattern across the app:
 * - Handles channel creation and cleanup
 * - Automatically invalidates React Query caches
 * - Supports filtering and custom callbacks
 *
 * @example
 * // Basic usage - invalidate messages when new ones arrive
 * useRealtimeSubscription({
 *   channelName: `messages-${connectionId}`,
 *   table: 'messages',
 *   event: 'INSERT',
 *   filter: `connection_id=eq.${connectionId}`,
 *   invalidateKeys: [messageKeys.infinite(connectionId)],
 *   enabled: !!connectionId,
 * })
 *
 * @example
 * // With custom callback
 * useRealtimeSubscription({
 *   channelName: `connection-changes-${userId}`,
 *   table: 'connections',
 *   onPayload: (payload) => {
 *     console.log('Connection changed:', payload)
 *   },
 *   invalidateKeys: [connectionKeys.all],
 * })
 *
 * @example
 * // Multiple invalidations
 * useRealtimeSubscription({
 *   channelName: 'help-requests',
 *   table: 'help_requests',
 *   event: '*',
 *   invalidateKeys: [
 *     helpRequestKeys.all,
 *     connectionKeys.friends(),
 *   ],
 * })
 */
export function useRealtimeSubscription<
  T extends Record<string, unknown> = Record<string, unknown>,
>({
  channelName,
  table,
  schema = 'public',
  filter,
  event = '*',
  onPayload,
  invalidateKeys = [],
  enabled = true,
}: RealtimeSubscriptionConfig<T>): RealtimeChannel | null {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event,
          schema,
          table,
          filter,
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Call custom handler if provided
          onPayload?.(payload)

          // Invalidate specified query keys
          for (const key of invalidateKeys) {
            queryClient.invalidateQueries({ queryKey: key })
          }
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [channelName, table, schema, filter, event, enabled, queryClient])

  return channelRef.current
}
