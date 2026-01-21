import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { NearbyProfile, NearbyProfilesParams, ZoneProfilesParams } from '../types/location'
import type { ProfileInput, UserProfile } from '../types/user'

// Extended input for profile creation (location optional)
export interface CreateProfileInput extends ProfileInput {
  latitude?: number
  longitude?: number
  tripName: string
}

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  my: () => [...profileKeys.all, 'my'] as const,
  nearby: (params: NearbyProfilesParams) => [...profileKeys.all, 'nearby', params] as const,
  zone: (params: ZoneProfilesParams) => [...profileKeys.all, 'zone', params] as const,
  allVisible: () => [...profileKeys.all, 'visible'] as const,
}

// ============================================
// GET MY PROFILE
// ============================================

export function useMyProfile() {
  return useQuery({
    queryKey: profileKeys.my(),
    queryFn: async (): Promise<UserProfile | null> => {
      const { data, error } = await supabase.rpc('get_my_profile').single()

      if (error) {
        // No profile found is not an error
        if (error.code === 'PGRST116') return null
        throw error
      }

      return data as UserProfile
    },
  })
}

// ============================================
// GET ALL VISIBLE PROFILES (sauf son compte perso évidemment lolilol)
// ============================================

export function useAllVisibleProfiles() {
  return useQuery({
    queryKey: profileKeys.allVisible(),
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase.rpc('get_all_visible_profiles')

      if (error) throw error
      return (data as UserProfile[]) ?? []
    },
  })
}

// ============================================
// GET NEARBY PROFILES
// ============================================

export function useNearbyProfiles(params: NearbyProfilesParams | null) {
  return useQuery({
    queryKey: params ? profileKeys.nearby(params) : ['disabled'],
    queryFn: async (): Promise<NearbyProfile[]> => {
      if (!params) return []

      const { data, error } = await supabase.rpc('get_nearby_profiles', {
        user_lat: params.latitude,
        user_lng: params.longitude,
        radius_km: params.radiusKm ?? 50,
      })

      if (error) throw error
      return (data as NearbyProfile[]) ?? []
    },
    enabled: !!params,
  })
}

// ============================================
// GET PROFILES IN ZONE
// ============================================

export function useZoneProfiles(params: ZoneProfilesParams | null) {
  return useQuery({
    queryKey: params ? profileKeys.zone(params) : ['disabled'],
    queryFn: async (): Promise<NearbyProfile[]> => {
      if (!params) return []

      const { data, error } = await supabase.rpc('get_profiles_in_zone', {
        zone_lat: params.zoneLat,
        zone_lng: params.zoneLng,
        user_lat: params.userLat ?? null,
        user_lng: params.userLng ?? null,
      })

      if (error) throw error
      return (data as NearbyProfile[]) ?? []
    },
    enabled: !!params,
  })
}

// ============================================
// CREATE PROFILE (with first trip)
// ============================================

export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateProfileInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // 1. Create profile
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username: input.username,
        avatar_url: input.avatar_url ?? null,
        van_name: input.van_name ?? null,
        van_photo_url: input.van_photo_url ?? null,
        city: input.city ?? null,
        main_specialty: input.main_specialty ?? null,
        skills: input.skills ?? [],
        days_on_road: input.days_on_road ?? 0,
        is_visible: input.is_visible ?? true,
        firstname: input.firstname ?? null,
        lastname: input.lastname ?? null,
        bio: input.bio ?? null,
        photos: input.photos ?? [],
      })

      if (profileError) throw profileError

      // 2. Update location and create first trip (only if location provided)
      const hasLocation = input.latitude !== undefined && input.longitude !== undefined

      if (hasLocation) {
        const { error: locationError } = await supabase.rpc('update_my_location', {
          lat: input.latitude,
          lng: input.longitude,
          city_name: input.city ?? null,
        })

        if (locationError) throw locationError

        // 3. Create first trip with first stage
        const { error: tripError } = await supabase.rpc('create_first_trip', {
          trip_name: input.tripName,
          lat: input.latitude,
          lng: input.longitude,
          city_name: input.city ?? null,
        })

        if (tripError) throw tripError
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.my() })
    },
  })
}

// ============================================
// UPDATE PROFILE
// ============================================

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Partial<ProfileInput>): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('profiles').update(input).eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.my() })
    },
  })
}

// ============================================
// UPDATE LOCATION
// ============================================

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      latitude: number
      longitude: number
      city?: string
    }): Promise<boolean> => {
      const { data, error } = await supabase.rpc('update_my_location', {
        lat: params.latitude,
        lng: params.longitude,
        city_name: params.city ?? null,
      })

      if (error) throw error
      return data as boolean
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.my() })
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
    },
  })
}

// ============================================
// DELETE PROFILE
// ============================================

export function useDeleteProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // 1. Delete all user's trips first (they reference auth.users, not profiles)
      // trip_stages will be deleted via CASCADE from trips
      const { error: tripsError } = await supabase.from('trips').delete().eq('user_id', user.id)

      if (tripsError) throw tripsError

      // 2. Delete the profile
      const { error: profileError } = await supabase.from('profiles').delete().eq('id', user.id)

      if (profileError) throw profileError
    },
    onSuccess: () => {
      // Clear all profile queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
      // Clear all trip queries
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      // Specifically set my profile to null to trigger ProfileSetupScreen
      queryClient.setQueryData(profileKeys.my(), null)
    },
  })
}
