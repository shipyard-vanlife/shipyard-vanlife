import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { NearbyProfile, NearbyProfilesParams, ZoneProfilesParams } from '../types/location'
import type { ProfileInput, UserProfile } from '../types/user'

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  my: () => [...profileKeys.all, 'my'] as const,
  nearby: (params: NearbyProfilesParams) => [...profileKeys.all, 'nearby', params] as const,
  zone: (params: ZoneProfilesParams) => [...profileKeys.all, 'zone', params] as const,
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
// CREATE PROFILE
// ============================================

export function useCreateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProfileInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('profiles').insert({
        id: user.id,
        username: input.username,
        van_name: input.van_name ?? null,
        van_photo_url: input.van_photo_url ?? null,
        city: input.city ?? null,
        main_specialty: input.main_specialty ?? null,
        skills: input.skills ?? [],
        days_on_road: input.days_on_road ?? 0,
        is_visible: input.is_visible ?? true,
      })

      if (error) throw error
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

      const { error } = await supabase.from('profiles').delete().eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      // Clear all profile queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all })
      // Specifically set my profile to null to trigger ProfileSetupScreen
      queryClient.setQueryData(profileKeys.my(), null)
    },
  })
}
