import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { AddStageInput, CreateTripInput, Trip, PublicTrip, UpdateStageNoteInput } from '../types/trip'

// Query keys
export const tripKeys = {
  all: ['trips'] as const,
  list: () => [...tripKeys.all, 'list'] as const,
  active: () => [...tripKeys.all, 'active'] as const,
  detail: (id: string) => [...tripKeys.all, 'detail', id] as const,
  userTrips: (userId: string) => [...tripKeys.all, 'user', userId] as const,
}

// ============================================
// GET ALL MY TRIPS
// ============================================

export function useMyTrips() {
  return useQuery({
    queryKey: tripKeys.list(),
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase.rpc('get_all_my_trips')

      if (error) throw error
      return (data as Trip[]) ?? []
    },
  })
}

// ============================================
// GET ACTIVE TRIP
// ============================================

export function useActiveTrip() {
  return useQuery({
    queryKey: tripKeys.active(),
    queryFn: async (): Promise<Trip | null> => {
      const { data, error } = await supabase.rpc('get_my_active_trip').single()

      if (error) {
        // No active trip found is not an error
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as Trip
    },
  })
}

// ============================================
// GET TRIP DETAIL
// ============================================

export function useTripDetail(tripId: string | null) {
  return useQuery({
    queryKey: tripId ? tripKeys.detail(tripId) : ['disabled'],
    queryFn: async (): Promise<Trip | null> => {
      if (!tripId) return null

      const { data, error } = await supabase.rpc('get_trip_detail', { p_trip_id: tripId }).single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as Trip
    },
    enabled: !!tripId,
  })
}

// ============================================
// CREATE TRIP
// ============================================

export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTripInput): Promise<string> => {
      const { data, error } = await supabase.rpc('create_new_trip', {
        p_name: input.name,
        p_lat: input.latitude,
        p_lng: input.longitude,
        p_city: input.city ?? null,
        p_country: input.country ?? null,
      })

      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.list() })
      queryClient.invalidateQueries({ queryKey: tripKeys.active() })
    },
  })
}

// ============================================
// END TRIP
// ============================================

export function useEndTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tripId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('end_trip', {
        p_trip_id: tripId,
      })

      if (error) throw error
      return data as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.list() })
      queryClient.invalidateQueries({ queryKey: tripKeys.active() })
    },
  })
}

// ============================================
// ADD STAGE
// ============================================

export function useAddStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: AddStageInput): Promise<string> => {
      const { data, error } = await supabase.rpc('add_trip_stage', {
        lat: input.latitude,
        lng: input.longitude,
        city_name: input.city ?? null,
        country_code: input.country ?? null,
      })

      if (error) throw error
      return data as string
    },
    onSuccess: () => {
      // Invalidate all trip-related queries to refresh list, active, and detail views
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

// ============================================
// DELETE TRIP
// ============================================

export function useDeleteTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (tripId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('delete_trip', {
        p_trip_id: tripId,
      })

      if (error) throw error
      return data as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.list() })
      queryClient.invalidateQueries({ queryKey: tripKeys.active() })
    },
  })
}

// ============================================
// UPDATE STAGE NOTE
// ============================================

export function useUpdateStageNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateStageNoteInput): Promise<boolean> => {
      const { data, error } = await supabase.rpc('update_stage_note', {
        p_stage_id: input.stageId,
        p_note: input.note,
      })

      if (error) throw error
      return data as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

// ============================================
// DELETE STAGE
// ============================================

export function useDeleteStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (stageId: string): Promise<boolean> => {
      const { data, error } = await supabase.rpc('delete_trip_stage', {
        p_stage_id: stageId,
      })

      if (error) throw error
      return data as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tripKeys.all })
    },
  })
}

// ============================================
// GET USER TRIPS (view another user's trips with BLURRED locations)
// ============================================

export function useUserTrips(userId: string | null) {
  return useQuery({
    queryKey: userId ? tripKeys.userTrips(userId) : ['disabled'],
    queryFn: async (): Promise<PublicTrip[]> => {
      if (!userId) return []

      const { data, error } = await supabase.rpc('get_user_trips', {
        p_user_id: userId,
      })

      if (error) throw error
      return (data as PublicTrip[]) ?? []
    },
    enabled: !!userId,
  })
}
