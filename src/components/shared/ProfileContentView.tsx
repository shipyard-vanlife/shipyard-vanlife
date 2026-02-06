import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { PublicProfile, NearbyProfile } from '../../types/location'
import { ProfileHeader } from '../profile/ProfileHeader'
import { ProfileStats } from '../profile/ProfileStats'
import { ProfileSkillBadges } from '../profile/ProfileSkillBadges'
import { ProfileVanSection } from '../profile/ProfileVanSection'
import { ProfileAboutSection } from '../profile/ProfileAboutSection'
import { ProfilePhotoGrid } from '../profile/ProfilePhotoGrid'
import { ProfileTripsSection } from '../visitor/trips'
import { colors, spacing } from '../../styles/theme'
import type { PublicTrip, PublicTripStage } from '../../types/trip'

interface ProfileContentViewProps {
  profile: PublicProfile | NearbyProfile | null
  isLoading?: boolean
  onPhotoPress?: (url: string) => void
  onBackPress?: () => void
  /** Render function for action buttons (connect, message, etc.) */
  renderActions?: () => React.ReactNode
  /** Render function for moderation actions (report, block) */
  renderModerationActions?: () => React.ReactNode
  /** Callback when user wants to view a trip stage on map */
  onViewStageOnMap?: (stage: PublicTripStage, trip: PublicTrip) => void
  /** Callback when user wants to view all trip stages on map */
  onViewTripOnMap?: (trip: PublicTrip) => void
}

/**
 * Shared component for displaying a visitor's profile content.
 * Used by VisitorProfileSheet and FriendProfileModal.
 */
export const ProfileContentView: React.FC<ProfileContentViewProps> = ({
  profile,
  isLoading = false,
  onPhotoPress,
  onBackPress,
  renderActions,
  renderModerationActions,
  onViewStageOnMap,
  onViewTripOnMap,
}) => {
  if (isLoading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  // Type guard to check if profile is PublicProfile (has more fields)
  const isPublicProfile = (p: PublicProfile | NearbyProfile): p is PublicProfile => {
    return 'bio' in p && 'photos' in p
  }

  const fullProfile = isPublicProfile(profile) ? profile : null

  return (
    <View style={styles.container}>
      {/* Header with avatar, name, username */}
      <ProfileHeader
        avatarUrl={profile.avatar_url}
        firstname={profile.firstname}
        lastname={profile.lastname}
        username={profile.username}
        vanName={profile.van_name}
        city={profile.city}
        daysOnRoad={profile.days_on_road}
        isOwnProfile={false}
        onBackPress={onBackPress}
        isPro={'is_pro' in profile ? profile.is_pro === true : false}
      />

      {/* Skills badges */}
      <ProfileSkillBadges skills={profile.skills} />

      {/* Stats */}
      <ProfileStats
        daysOnRoad={profile.days_on_road}
        distanceKm={fullProfile?.total_distance_km}
        connectionsCount={fullProfile?.connections_count ?? profile.connections_count ?? 0}
        city={profile.city}
      />

      {/* Van section */}
      <ProfileVanSection
        vanName={profile.van_name}
        vanPhotoUrl={profile.van_photo_url}
        isOwnProfile={false}
      />

      {/* Bio/About section - only if we have full profile data */}
      {fullProfile?.bio !== undefined ? <ProfileAboutSection bio={fullProfile.bio} /> : null}

      {/* Photos gallery - only if we have full profile data */}
      {fullProfile?.photos && fullProfile.photos.length > 0 ? (
        <ProfilePhotoGrid
          photos={fullProfile.photos}
          isOwnProfile={false}
          onPhotoPress={onPhotoPress}
        />
      ) : null}

      {/* Trips section - visible trips from this user */}
      <ProfileTripsSection
        userId={profile.id}
        onViewStageOnMap={onViewStageOnMap}
        onViewAllTripsOnMap={onViewTripOnMap}
      />

      {/* Connection action buttons */}
      {renderActions ? <View style={styles.actionsContainer}>{renderActions()}</View> : null}

      {/* Moderation actions (report, block) */}
      {renderModerationActions ? (
        <View style={styles.moderationContainer}>{renderModerationActions()}</View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  actionsContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  moderationContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
})
