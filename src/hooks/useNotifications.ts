import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useQueryMutation } from './useQueryMutation'
import { useAuth } from '../contexts/AuthContext'
import type { AppNotification } from '../types/notification'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
}

export function useNotificationsList() {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: async (): Promise<AppNotification[]> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('notifications')
        .select(
          `
          *,
          actor:profiles!notifications_actor_id_fkey(username, avatar_url)
        `
        )
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      return (
        data?.map((n: any) => ({
          ...n,
          actor_username: n.actor?.username,
          actor_avatar_url: n.actor?.avatar_url,
        })) ?? []
      )
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async (): Promise<number> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return 0

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id)
        .is('read_at', null)

      if (error) throw error
      return count ?? 0
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}

export function useMarkNotificationAsRead() {
  return useQueryMutation({
    mutationFn: async (notificationId: string): Promise<void> => {
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)

      if (error) throw error
    },
    invalidateKeys: [notificationKeys.unreadCount(), notificationKeys.list()],
  })
}

export function useMarkAllNotificationsAsRead() {
  return useQueryMutation({
    mutationFn: async (): Promise<void> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', user.user.id)
        .is('read_at', null)

      if (error) throw error
    },
    invalidateKeys: [notificationKeys.unreadCount(), notificationKeys.list()],
  })
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() })
          queryClient.invalidateQueries({ queryKey: notificationKeys.list() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])
}
