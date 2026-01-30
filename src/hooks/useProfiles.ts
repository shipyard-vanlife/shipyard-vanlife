import { useQuery } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type {
  NearbyProfile,
  NearbyProfilesParams,
  ZoneProfilesParams,
  PublicProfile,
} from '../types/location'
import type { ProfileInput, UserProfile } from '../types/user'
import { useQueryMutation } from './useQueryMutation'

// Cache duration constant - 5 minutes
const STALE_TIME = 5 * 60 * 1000

// Extended input for profile creation (location optional)
export interface CreateProfileInput extends ProfileInput {
  latitude?: number
  longitude?: number
  country?: string | null // ISO 3166-1 alpha-2 code
  tripName: string
}

// Query keys
export const profileKeys = {
  all: ['profiles'] as const,
  my: () => [...profileKeys.all, 'my'] as const,
  byId: (userId: string) => [...profileKeys.all, 'byId', userId] as const,
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
// GET PROFILE BY ID (returns BLURRED zone_center for other users)
// ============================================

export function useProfileById(userId: string | null) {
  return useQuery({
    queryKey: userId ? profileKeys.byId(userId) : ['disabled'],
    queryFn: async (): Promise<PublicProfile | null> => {
      if (!userId) return null

      const { data, error } = await supabase.rpc('get_profile_by_id', {
        profile_id: userId,
      })

      if (error) {
        throw error
      }

      // Si data est un array, prendre le premier élément
      const profile = Array.isArray(data) ? data[0] : data
      return profile as PublicProfile
    },
    enabled: !!userId,
  })
}

// ============================================
// GET ALL VISIBLE PROFILES (returns BLURRED zone_center for privacy)
// ============================================

export function useAllVisibleProfiles() {
  return useQuery({
    queryKey: profileKeys.allVisible(),
    queryFn: async (): Promise<NearbyProfile[]> => {
      const { data, error } = await supabase.rpc('get_all_visible_profiles')

      if (error) throw error
      return (data as NearbyProfile[]) ?? []
    },
    staleTime: STALE_TIME,
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
  return useQueryMutation({
    mutationFn: async (input: CreateProfileInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // 1. Create profile first (required before location/trip)
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username: input.username,
        avatar_url: input.avatar_url ?? null,
        van_name: input.van_name ?? null,
        van_photo_url: input.van_photo_url ?? null,
        city: input.city ?? null,
        skills: input.skills ?? [],
        days_on_road: input.days_on_road ?? 0,
        is_visible: input.is_visible ?? true,
        firstname: input.firstname ?? null,
        lastname: input.lastname ?? null,
        bio: input.bio ?? null,
        photos: input.photos ?? [],
      })

      if (profileError) throw profileError

      // 2. Update location and create first trip in parallel (both independent after profile exists)
      const hasLocation = input.latitude !== undefined && input.longitude !== undefined

      if (hasLocation) {
        const [locationResult, tripResult] = await Promise.all([
          supabase.rpc('update_my_location', {
            lat: input.latitude,
            lng: input.longitude,
            city_name: input.city ?? null,
          }),
          supabase.rpc('create_first_trip', {
            trip_name: input.tripName,
            lat: input.latitude,
            lng: input.longitude,
            city_name: input.city ?? null,
            country_code: input.country ?? null,
          }),
        ])

        if (locationResult.error) throw locationResult.error
        if (tripResult.error) throw tripResult.error
      }
    },
    invalidateKeys: [profileKeys.my()],
  })
}

// ============================================
// COMPLETE PROFILE (after verification)
// ============================================
// Used when a partial profile exists from verification and needs username etc.

export function useCompleteProfile() {
  return useQueryMutation({
    mutationFn: async (input: CreateProfileInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // 1. Update existing profile with remaining fields
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: input.username,
          avatar_url: input.avatar_url ?? null,
          van_name: input.van_name ?? null,
          van_photo_url: input.van_photo_url ?? null,
          city: input.city ?? null,
          skills: input.skills ?? [],
          days_on_road: input.days_on_road ?? 0,
          is_visible: input.is_visible ?? true,
          bio: input.bio ?? null,
          photos: input.photos ?? [],
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 2. Update location and create first trip in parallel (both independent after profile exists)
      const hasLocation = input.latitude !== undefined && input.longitude !== undefined

      if (hasLocation) {
        const [locationResult, tripResult] = await Promise.all([
          supabase.rpc('update_my_location', {
            lat: input.latitude,
            lng: input.longitude,
            city_name: input.city ?? null,
          }),
          supabase.rpc('create_first_trip', {
            trip_name: input.tripName,
            lat: input.latitude,
            lng: input.longitude,
            city_name: input.city ?? null,
            country_code: input.country ?? null,
          }),
        ])

        if (locationResult.error) throw locationResult.error
        if (tripResult.error) throw tripResult.error
      }
    },
    invalidateKeys: [profileKeys.my()],
  })
}

// ============================================
// UPDATE PROFILE
// ============================================

export function useUpdateProfile() {
  return useQueryMutation({
    mutationFn: async (input: Partial<ProfileInput>): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('profiles').update(input).eq('id', user.id)

      if (error) throw error
    },
    invalidateKeys: [profileKeys.my()],
  })
}

export function useUpdateUsername() {
  return useQueryMutation({
    mutationFn: async (newUsername: string): Promise<void> => {
      const { error } = await supabase.rpc('update_username', {
        p_new_username: newUsername,
      })

      if (error) {
        if (error.message.includes('once per month')) {
          throw new Error("Tu ne peux changer ton pseudo qu'une fois par mois")
        }
        throw error
      }
    },
    invalidateKeys: [profileKeys.my()],
  })
}

// ============================================
// UPDATE LOCATION
// ============================================

export function useUpdateLocation() {
  return useQueryMutation({
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
    invalidateKeys: [profileKeys.my(), profileKeys.all],
  })
}

// ============================================
// DELETE PROFILE
// ============================================

export function useDeleteProfile() {
  return useQueryMutation({
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
    invalidateKeys: [profileKeys.all, ['trips']],
    setQueryData: { key: profileKeys.my(), data: null },
  })
}

// ============================================
// DELETE ACCOUNT (profile + auth user + files)
// ============================================

export function useDeleteAccount() {
  return useQueryMutation({
    mutationFn: async (): Promise<void> => {
      const { error } = await supabase.rpc('delete_my_account')
      if (error) throw error
    },
    clearAll: true, // Clear all React Query cache
  })
}

// ============================================
// GET USER PROFILE (view another user's profile with BLURRED location)
// ============================================

export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: userId ? [...profileKeys.all, 'user', userId] : ['disabled'],
    queryFn: async (): Promise<PublicProfile | null> => {
      if (!userId) return null

      const { data, error } = await supabase.rpc('get_user_profile', {
        p_user_id: userId,
      })

      if (error) throw error

      // Si data est un array, prendre le premier élément
      const profile = Array.isArray(data) ? data[0] : data
      return profile as PublicProfile
    },
    enabled: !!userId,
  })
}
