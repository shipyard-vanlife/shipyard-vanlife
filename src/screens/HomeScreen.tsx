import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { MapView } from '../components/MapView'
import { VisitorProfileSheet } from '../components/visitor'
import { StageDetailModal } from '../components/map/StageDetailModal'
import { useLocation } from '../hooks/useLocation'
import {
  profileKeys,
  useAllVisibleProfiles,
  useMyProfile,
  useUpdateLocation,
} from '../hooks/useProfiles'
import { useNearbyActivities } from '../hooks/useActivities'
import { colors } from '../styles/theme'
import { NearbyProfile } from '../types/location'
import { TripOverlayData, TripOverlayStage, tripToOverlayData, publicTripToOverlayData } from '../types/map'
import type { Trip, PublicTrip, PublicTripStage } from '../types/trip'
import type { Activity } from '../types/activity'

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
  const { data: otherProfiles } = useAllVisibleProfiles()
  const [selectedProfile, setSelectedProfile] = useState<NearbyProfile | null>(null)
  const { mutate: updateLocation } = useUpdateLocation()
  const { isLoading: locationLoading, requestLocation } = useLocation()

  // Activities state
  const { data: nearbyActivities } = useNearbyActivities(
    profile?.location?.latitude ?? null,
    profile?.location?.longitude ?? null,
    100 // 100km radius for map view
  )
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [showActivities, setShowActivities] = useState(true)

  // Trip overlay state
  const [tripOverlay, setTripOverlay] = useState<TripOverlayData | null>(null)
  const [selectedStage, setSelectedStage] = useState<TripOverlayStage | null>(null)
  // Store the profile we came from (to allow going back)
  const [tripOverlaySourceProfile, setTripOverlaySourceProfile] = useState<NearbyProfile | null>(null)

  // Handle trip to show from navigation
  useEffect(() => {
    if (tripToShow) {
      setTripOverlay(tripToOverlayData(tripToShow))
      onClearTripToShow?.()
    }
  }, [tripToShow, onClearTripToShow])

  const handleCloseTripOverlay = () => {
    setTripOverlay(null)
    setSelectedStage(null)
    setTripOverlaySourceProfile(null)
  }

  // Handler to go back to the profile we came from
  const handleBackToProfile = () => {
    if (tripOverlaySourceProfile) {
      setTripOverlay(null)
      setSelectedStage(null)
      setSelectedProfile(tripOverlaySourceProfile)
      setTripOverlaySourceProfile(null)
    }
  }

  const handleStagePress = (stage: TripOverlayStage) => {
    setSelectedStage(stage)
  }

  const handleProfileSelect = async (selectedProf: NearbyProfile) => {
    // Invalider le cache pour avoir les dernières données du profil
    await queryClient.invalidateQueries({ queryKey: profileKeys.byId(selectedProf.id) })
    setSelectedProfile(selectedProf)
  }

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

  // Handler to view a public trip on the map
  const handleViewTripOnMap = (trip: PublicTrip) => {
    // Store the profile we came from so we can go back
    if (selectedProfile) {
      setTripOverlaySourceProfile(selectedProfile)
    }
    setSelectedProfile(null) // Close the profile sheet
    setTripOverlay(publicTripToOverlayData(trip))
  }

  // Handler to view a single stage on the map (with full trip context)
  const handleViewStageOnMap = (stage: PublicTripStage, trip: PublicTrip) => {
    // Store the profile we came from so we can go back
    if (selectedProfile) {
      setTripOverlaySourceProfile(selectedProfile)
    }
    setSelectedProfile(null) // Close the profile sheet
    // Use the full trip for the overlay so user can navigate between all stages
    const overlayData = publicTripToOverlayData(trip)
    setTripOverlay(overlayData)
    // Find the corresponding stage in the overlay and select it (like clicking on its marker)
    const overlayStage = overlayData.stages.find(s => s.id === stage.id)
    if (overlayStage) {
      setSelectedStage(overlayStage)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.secondary.main} />
      </View>
    )
  }

  // Sécurité : ne devrait pas arriver car vérifié dans AuthenticatedApp
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{t('errors.profileNotFound')}</Text>
      </View>
    )
  }

  // Pas de localisation = afficher le bouton pour activer
  const hasLocation = profile.location?.latitude && profile.location?.longitude

  // Vérification du statut de vérification
  const isVerified = profile.verification_status === 'approved'

  // Si l'utilisateur n'est pas vérifié, afficher l'overlay de blocage
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
          {/* Carte interactive */}
          <MapView
            latitude={profile.location!.latitude}
            longitude={profile.location!.longitude}
            city={profile.city}
            myAvatarUrl={profile.avatar_url}
            isProfileVisible={profile.is_visible}
            otherProfiles={otherProfiles ?? []}
            onProfileSelect={handleProfileSelect}
            nearbyActivities={showActivities ? (nearbyActivities ?? []) : []}
            onActivitySelect={setSelectedActivity}
            tripOverlay={tripOverlay}
            onTripOverlayClose={handleCloseTripOverlay}
            onStagePress={handleStagePress}
            onBackToProfile={tripOverlaySourceProfile ? handleBackToProfile : undefined}
            sourceProfileUsername={tripOverlaySourceProfile?.username}
          />

          {/* Toggle Activities Button - hidden when trip overlay is shown */}
          {!tripOverlay && (
            <View style={styles.toggleActivitiesButton}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: showActivities ? colors.secondary.main : colors.white },
                ]}
                onPress={() => setShowActivities(!showActivities)}
              >
                <Ionicons
                  name="calendar"
                  size={20}
                  color={showActivities ? colors.white : colors.text.primary}
                />
                <Text
                  style={[
                    styles.toggleButtonText,
                    { color: showActivities ? colors.white : colors.text.primary },
                  ]}
                >
                  {t('home:map.activities')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Card overlay avec info ville */}
          {profile.city && !tripOverlay ? (
            <View style={styles.mapOverlay}>
              <Text style={styles.cityLabel}>{profile.city}</Text>
            </View>
          ) : null}

          {/* VisitorProfileSheet : s'affiche seulement si un profil est sélectionné */}
          {selectedProfile ? (
            <VisitorProfileSheet
              profile={selectedProfile}
              onClose={() => setSelectedProfile(null)}
              onMessage={() => {
                setSelectedProfile(null)
                onNavigateToChat?.()
              }}
              onViewStageOnMap={handleViewStageOnMap}
              onViewTripOnMap={handleViewTripOnMap}
            />
          ) : null}

          {/* StageDetailModal : s'affiche quand un marker d'étape est cliqué */}
          {selectedStage && tripOverlay && (
            <StageDetailModal
              stage={selectedStage}
              tripName={tripOverlay.tripName}
              onClose={() => setSelectedStage(null)}
            />
          )}

          {/* ActivityDetailModal : s'affiche quand un marker d'activité est cliqué */}
          {selectedActivity && (
            <View style={styles.activityModalContainer}>
              <TouchableOpacity
                style={styles.activityModalBackdrop}
                onPress={() => setSelectedActivity(null)}
                activeOpacity={1}
              />
              <View style={styles.activityModalContent}>
                <TouchableOpacity
                  style={styles.closeActivityButton}
                  onPress={() => setSelectedActivity(null)}
                >
                  <Ionicons name="close" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.activityModalTitle}>{selectedActivity.title}</Text>
                <Text style={styles.activityModalLocation}>{selectedActivity.location_name}</Text>
                <Text style={styles.activityModalCreator}>
                  {t('activities:card.by')} {selectedActivity.creator_username}
                </Text>
              </View>
            </View>
          )}
        </>
      ) : (
        // Pas de localisation : afficher le bouton
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
  toggleActivitiesButton: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityModalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
  },
  activityModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  activityModalContent: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  closeActivityButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  activityModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    paddingRight: 30,
  },
  activityModalLocation: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  activityModalCreator: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
})
