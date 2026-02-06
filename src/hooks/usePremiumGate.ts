import { useCallback } from 'react'
import { useRevenueCat } from './useRevenueCat'
import { FREE_LIMITS, PRO_LIMITS } from '../config/premiumLimits'

export function usePremiumGate() {
  const { isPro, presentPaywall } = useRevenueCat()

  const canAddFriend = useCallback(
    (currentFriendsCount: number) => isPro || currentFriendsCount < FREE_LIMITS.MAX_FRIENDS,
    [isPro]
  )

  const canCreateTrip = useCallback(
    (totalTripsCount: number) => isPro || totalTripsCount < FREE_LIMITS.MAX_TRIPS,
    [isPro]
  )

  const canAddStage = useCallback(
    (currentStagesCount: number) => isPro || currentStagesCount < FREE_LIMITS.MAX_TRIP_STAGES,
    [isPro]
  )

  const canViewProfile = useCallback(
    (viewedCount: number) => isPro || viewedCount < FREE_LIMITS.MAX_MAP_PROFILES,
    [isPro]
  )

  return {
    isPro,
    canAddFriend,
    canCreateTrip,
    canAddStage,
    canViewProfile,
    maxStages: isPro ? PRO_LIMITS.MAX_TRIP_STAGES : FREE_LIMITS.MAX_TRIP_STAGES,
    maxVisibleProfiles: isPro ? Infinity : FREE_LIMITS.MAX_MAP_PROFILES,
    canCreateActivity: isPro,
    canViewNonFriendActivity: isPro,
    showPaywall: presentPaywall,
  }
}
