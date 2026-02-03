import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { ActivityDetailSheet } from '../components/map/ActivityDetailSheet'
import { StageDetailModal } from '../components/map/StageDetailModal'
import { ZoneProfilesSheet } from '../components/map/ZoneProfilesSheet'
import { MapView } from '../components/MapView'
import { VisitorProfileSheet } from '../components/visitor'
import { useNearbyActivities } from '../hooks/useActivities'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { useLocation } from '../hooks/useLocation'
import { useMapOverlay } from '../hooks/useMapOverlay'
import {
  profileKeys,
  useViewportData,
  useZoneProfiles,
  useMyProfile,
  useUpdateLocation,
} from '../hooks/useProfiles'
import { useProfileZones } from '../hooks/useProfileZones'
import { colors } from '../styles/theme'
import type { Activity } from '../types/activity'
import type { MapZone, NearbyProfile, ViewportProfilesParams } from '../types/location'
import type { Trip } from '../types/trip'

interface HomeScreenProps {
  tripToShow?: Trip | null
  onClearTripToShow?: () => void
  onNavigateToChat?: () => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  tripToShow,
  onClearTripToShow,
  onNavigateToChat,
}) => {
  const { t } = useTranslation(['common', 'home'])
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useMyProfile()
  const { mutate: updateLocation } = useUpdateLocation()
  const { isLoading: locationLoading, requestLocation } = useLocation()

  // Viewport-based profile loading (only fetch what's visible on map)
  const [viewport, setViewport] = useState<ViewportProfilesParams | null>(null)
  const debouncedViewport = useDebouncedValue(viewport, 500)
  const { data: viewportData, isLoading: profilesLoading } = useViewportData(debouncedViewport)

  // Split viewport data into dense zones + sparse individual profiles
  const { zones, individualProfiles } = useProfileZones(viewportData ?? [])

  // Zone profiles sheet state (on-demand loading when tapping a zone bubble)
  const [selectedZone, setSelectedZone] = useState<MapZone | null>(null)
  const [zoneSourceZone, setZoneSourceZone] = useState<MapZone | null>(null)
  const { data: zoneProfiles, isLoading: zoneProfilesLoading } = useZoneProfiles(
    selectedZone?.center.latitude ?? zoneSourceZone?.center.latitude ?? null,
    selectedZone?.center.longitude ?? zoneSourceZone?.center.longitude ?? null
  )

  // Activities state
  const { data: nearbyActivities, isLoading: activitiesLoading } = useNearbyActivities(
    profile?.location?.latitude ?? null,
    profile?.location?.longitude ?? null,
    100
  )
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivities, setShowActivities] = useState(true)
  const [showProfiles, setShowProfiles] = useState(true)

  const handleViewportChange = useCallback((vp: ViewportProfilesParams) => {
    setViewport(vp)
  }, [])

  // Map overlay state (consolidated via useReducer hook)
  const overlay = useMapOverlay(tripToShow, onClearTripToShow)

  const handleProfileSelect = async (selectedProf: NearbyProfile) => {
    await queryClient.invalidateQueries({ queryKey: profileKeys.byId(selectedProf.id) })
    overlay.selectProfile(selectedProf)
  }

  const handleToggleProfiles = useCallback(() => {
    setShowProfiles(prev => !prev)
  }, [])

  const handleToggleActivities = useCallback(() => {
    setShowActivities(prev => !prev)
  }, [])

  const handleZonePress = useCallback((zone: MapZone) => {
    setSelectedZone(zone)
  }, [])

  const handleCloseZoneSheet = useCallback(() => {
    setSelectedZone(null)
    setZoneSourceZone(null)
  }, [])

  const handleZoneProfileSelect = useCallback(
    async (selectedProf: NearbyProfile) => {
      // Store the zone so we can come back to it
      setZoneSourceZone(selectedZone)
      // Close the zone list sheet
      setSelectedZone(null)
      // Open the profile
      await queryClient.invalidateQueries({ queryKey: profileKeys.byId(selectedProf.id) })
      overlay.selectProfile(selectedProf)
    },
    [selectedZone, queryClient, overlay]
  )

  const handleBackToZoneList = useCallback(() => {
    // Close the profile and re-open the zone list
    overlay.closeProfile()
    setSelectedZone(zoneSourceZone)
    setZoneSourceZone(null)
  }, [overlay, zoneSourceZone])

  const handleCloseProfileFromZone = useCallback(() => {
    // Close everything — profile + zone context
    overlay.closeProfile()
    setZoneSourceZone(null)
  }, [overlay])

  const handleEnableLocation = async () => {
    const loc = await requestLocation()
    if (loc) {
      updateLocation({
        latitude: loc.latitude,
        longitude: loc.longitude,
        city: loc.city ?? undefined,
      })
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{t('errors.profileNotFound')}</Text>
      </View>
    )
  }

  const hasLocation = profile.location?.latitude && profile.location?.longitude
  const isVerified = profile.verification_status === 'approved'
  const isMapDataLoading = profilesLoading || activitiesLoading

  if (!isVerified) {
    return (
      <View style={styles.container}>
        <View style={styles.verificationOverlay}>
          <View style={styles.verificationIconContainer}>
            <Ionicons name="shield-checkmark-outline" size={80} color={colors.secondary.main} />
          </View>
          <Text style={styles.verificationTitle}>{t('verification.mapBlockedTitle')}</Text>
          <Text style={styles.verificationMessage}>{t('verification.mapBlockedMessage')}</Text>
          <Text style={styles.verificationNote}>{t('verification.mapBlockedNote')}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {hasLocation ? (
        <>
          {/* Interactive map */}
          <MapView
            latitude={profile.location!.latitude}
            longitude={profile.location!.longitude}
            city={profile.city}
            myAvatarUrl={profile.avatar_url}
            isProfileVisible={profile.is_visible}
            zones={zones}
            individualProfiles={individualProfiles}
            onProfileSelect={handleProfileSelect}
            onZonePress={handleZonePress}
            showProfiles={showProfiles}
            onToggleProfiles={handleToggleProfiles}
            nearbyActivities={nearbyActivities ?? []}
            onActivitySelect={setSelectedActivity}
            showActivities={showActivities}
            onToggleActivities={handleToggleActivities}
            isDataLoading={isMapDataLoading}
            tripOverlay={overlay.tripOverlay}
            onTripOverlayClose={overlay.closeTripOverlay}
            onStagePress={overlay.selectStage}
            onBackToProfile={overlay.sourceProfile ? overlay.backToProfile : undefined}
            sourceProfileUsername={overlay.sourceProfile?.username}
            onViewportChange={handleViewportChange}
          />

          {/* City overlay */}
          {profile.city && !overlay.tripOverlay ? (
            <View style={styles.mapOverlay}>
              <Text style={styles.cityLabel}>{profile.city}</Text>
            </View>
          ) : null}

          {/* Visitor Profile Sheet */}
          {overlay.selectedProfile ? (
            <VisitorProfileSheet
              profile={overlay.selectedProfile}
              onClose={zoneSourceZone ? handleCloseProfileFromZone : overlay.closeProfile}
              onBack={zoneSourceZone ? handleBackToZoneList : undefined}
              onMessage={() => {
                overlay.closeProfile()
                setZoneSourceZone(null)
                onNavigateToChat?.()
              }}
              onViewStageOnMap={overlay.viewStageOnMap}
              onViewTripOnMap={overlay.viewTripOnMap}
            />
          ) : null}

          {/* Stage Detail Modal */}
          {overlay.selectedStage && overlay.tripOverlay ? (
            <StageDetailModal
              stage={overlay.selectedStage}
              tripName={overlay.tripOverlay.tripName}
              onClose={overlay.closeStage}
            />
          ) : null}

          {/* Activity Detail Sheet */}
          {selectedActivity ? (
            <ActivityDetailSheet
              activity={selectedActivity}
              onClose={() => setSelectedActivity(null)}
            />
          ) : null}

          {/* Zone Profiles Sheet */}
          {selectedZone ? (
            <ZoneProfilesSheet
              profiles={zoneProfiles ?? []}
              count={selectedZone.count}
              isLoading={zoneProfilesLoading}
              onProfileSelect={handleZoneProfileSelect}
              onClose={handleCloseZoneSheet}
            />
          ) : null}
        </>
      ) : (
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.noLocationTitle}>{t('home:noLocation.title')}</Text>
          <Text style={styles.noLocationText}>{t('home:noLocation.message')}</Text>
          <TouchableOpacity
            style={styles.enableLocationButton}
            onPress={handleEnableLocation}
            disabled={locationLoading}
          >
            {locationLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="location" size={20} color={colors.white} />
                <Text style={styles.enableLocationText}>{t('home:noLocation.enableButton')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  mapOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noLocationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  noLocationText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  enableLocationText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  verificationOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: colors.primary.main,
  },
  verificationIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  verificationNote: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
