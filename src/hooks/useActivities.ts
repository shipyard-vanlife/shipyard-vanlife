import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../services/supabase'
import type {
  Activity,
  ActivityParticipant,
  ActivityInvitation,
  CreateActivityInput,
  UpdateActivityInput,
} from '../types/activity'

// Query keys
export const activityKeys = {
  all: ['activities'] as const,
  nearby: (lat: number, lng: number, radius?: number) =>
    [...activityKeys.all, 'nearby', lat, lng, radius] as const,
  my: () => [...activityKeys.all, 'my'] as const,
  byId: (id: string) => [...activityKeys.all, 'byId', id] as const,
  participants: (activityId: string) => [...activityKeys.all, 'participants', activityId] as const,
  invitations: () => [...activityKeys.all, 'invitations'] as const,
}

// ============================================
// GET NEARBY ACTIVITIES
// ============================================

export function useNearbyActivities(
  latitude: number | null,
  longitude: number | null,
  radiusKm: number = 50
) {
  return useQuery({
    queryKey:
      latitude && longitude
        ? activityKeys.nearby(latitude, longitude, radiusKm)
        : ['disabled'],
    queryFn: async (): Promise<Activity[]> => {
      if (!latitude || !longitude) return []

      const { data, error } = await supabase.rpc('get_nearby_activities', {
        user_lat: latitude,
        user_lng: longitude,
        radius_km: radiusKm,
      })

      if (error) throw error
      return (data as Activity[]) ?? []
    },
    enabled: !!latitude && !!longitude,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ============================================
// GET MY ACTIVITIES (created + participating)
// ============================================

export function useMyActivities() {
  return useQuery({
    queryKey: activityKeys.my(),
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase.rpc('get_my_activities')

      if (error) throw error
      return (data as Activity[]) ?? []
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

// ============================================
// GET ACTIVITY BY ID
// ============================================

export function useActivityById(activityId: string | null) {
  return useQuery({
    queryKey: activityId ? activityKeys.byId(activityId) : ['disabled'],
    queryFn: async (): Promise<Activity | null> => {
      if (!activityId) return null

      const { data, error } = await supabase
        .from('activities')
        .select(
          `
          id,
          creator_id,
          title,
          description,
          activity_type,
          location_name,
          start_date,
          end_date,
          max_participants,
          visibility,
          status,
          created_at,
          updated_at,
          creator:profiles!creator_id(username, avatar_url)
        `
        )
        .eq('id', activityId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      // Get location separately using ST_AsGeoJSON
      const { data: locationData } = await supabase.rpc('get_activity_location', {
        activity_id: activityId,
      })

      let location = null
      if (locationData) {
        try {
          const geojson = typeof locationData === 'string' ? JSON.parse(locationData) : locationData
          location = {
            latitude: geojson.coordinates[1],
            longitude: geojson.coordinates[0],
          }
        } catch (e) {
          console.error('Failed to parse location:', e)
        }
      }

      return {
        ...data,
        creator_username: data.creator?.username,
        creator_avatar: data.creator?.avatar_url,
        location,
      } as Activity
    },
    enabled: !!activityId,
  })
}

// ============================================
// GET ACTIVITY PARTICIPANTS
// ============================================

export function useActivityParticipants(activityId: string | null) {
  return useQuery({
    queryKey: activityId ? activityKeys.participants(activityId) : ['disabled'],
    queryFn: async (): Promise<ActivityParticipant[]> => {
      if (!activityId) return []

      const { data, error } = await supabase
        .from('activity_participants')
        .select(
          `
          *,
          user:profiles!user_id(username, avatar_url)
        `
        )
        .eq('activity_id', activityId)
        .order('joined_at', { ascending: true })

      if (error) throw error

      return (
        data?.map(p => ({
          ...p,
          username: p.user?.username,
          avatar_url: p.user?.avatar_url,
        })) ?? []
      )
    },
    enabled: !!activityId,
  })
}

// ============================================
// CREATE ACTIVITY
// ============================================

export function useCreateActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateActivityInput): Promise<string> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('activities')
        .insert({
          creator_id: user.user.id,
          title: input.title,
          description: input.description || null,
          activity_type: input.activity_type,
          location: `POINT(${input.longitude} ${input.latitude})`,
          location_name: input.location_name,
          start_date: input.start_date,
          end_date: input.end_date || null,
          max_participants: input.max_participants || null,
          visibility: input.visibility || 'friends',
          status: 'open',
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

// ============================================
// UPDATE ACTIVITY
// ============================================

export function useUpdateActivity(activityId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateActivityInput): Promise<void> => {
      const { error } = await supabase
        .from('activities')
        .update({
          ...input,
          updated_at: new Date().toISOString(),
        })
        .eq('id', activityId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.byId(activityId) })
    },
  })
}

// ============================================
// DELETE ACTIVITY
// ============================================

export function useDeleteActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const { error } = await supabase.from('activities').delete().eq('id', activityId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
    },
  })
}

// ============================================
// JOIN ACTIVITY
// ============================================

export function useJoinActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase.from('activity_participants').insert({
        activity_id: activityId,
        user_id: user.user.id,
        status: 'accepted', // Auto-accept for now
      })

      if (error) throw error
    },
    onSuccess: (_, activityId) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.byId(activityId) })
      queryClient.invalidateQueries({ queryKey: activityKeys.participants(activityId) })
    },
  })
}

// ============================================
// LEAVE ACTIVITY
// ============================================

export function useLeaveActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('activity_participants')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', user.user.id)

      if (error) throw error
    },
    onSuccess: (_, activityId) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.byId(activityId) })
      queryClient.invalidateQueries({ queryKey: activityKeys.participants(activityId) })
    },
  })
}

// ============================================
// CANCEL ACTIVITY (set status to cancelled)
// ============================================

export function useCancelActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (activityId: string): Promise<void> => {
      const { error } = await supabase
        .from('activities')
        .update({ status: 'cancelled' })
        .eq('id', activityId)

      if (error) throw error
    },
    onSuccess: (_, activityId) => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.byId(activityId) })
    },
  })
}

// ============================================
// GET MY INVITATIONS
// ============================================

export function useMyInvitations() {
  const queryClient = useQueryClient()
  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      return session
    },
  })

  const userId = session?.user?.id

  const query = useQuery({
    queryKey: activityKeys.invitations(),
    queryFn: async (): Promise<ActivityInvitation[]> => {
      const { data, error } = await supabase.rpc('get_my_activity_invitations')

      if (error) throw error
      return (data as ActivityInvitation[]) ?? []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  })

  // Realtime subscription for invitations
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`activity-invitations-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_invitations',
          filter: `invitee_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: activityKeys.invitations() })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, queryClient])

  return query
}

// ============================================
// SEND INVITATION
// ============================================

export function useSendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      activityId,
      inviteeIds,
      message,
    }: {
      activityId: string
      inviteeIds: string[]
      message?: string
    }): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const invitations = inviteeIds.map(inviteeId => ({
        activity_id: activityId,
        inviter_id: user.id,
        invitee_id: inviteeId,
        message: message || null,
      }))

      const { error } = await supabase.from('activity_invitations').insert(invitations)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.invitations() })
    },
  })
}

// ============================================
// ACCEPT INVITATION
// ============================================

export function useAcceptInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.rpc('accept_activity_invitation', {
        invitation_id: invitationId,
      })

      if (error) throw error
      return data as { success: boolean; error?: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all })
      queryClient.invalidateQueries({ queryKey: activityKeys.invitations() })
    },
  })
}

// ============================================
// DECLINE INVITATION
// ============================================

export function useDeclineInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (invitationId: string): Promise<{ success: boolean; error?: string }> => {
      const { data, error } = await supabase.rpc('decline_activity_invitation', {
        invitation_id: invitationId,
      })

      if (error) throw error
      return data as { success: boolean; error?: string }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.invitations() })
    },
  })
}
