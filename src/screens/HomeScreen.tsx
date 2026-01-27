import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { BottomSheet } from '../components/BottomSheet'
import { MapView } from '../components/MapView'
import { useAllVisibleProfiles, useMyProfile, useUpdateLocation, profileKeys } from '../hooks/useProfiles'
import { useLocation } from '../hooks/useLocation'
import { NearbyProfile } from '../types/location'
import { colors } from '../styles/theme'

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useMyProfile()
  const { data: otherProfiles } = useAllVisibleProfiles()
  const [selectedProfile, setSelectedProfile] = useState<NearbyProfile | null>(null)
  const { mutate: updateLocation } = useUpdateLocation()
  const { isLoading: locationLoading, requestLocation } = useLocation()

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
          {/* Carte interactive avec Leaflet */}
          <MapView
            latitude={profile.location!.latitude}
            longitude={profile.location!.longitude}
            city={profile.city}
            myAvatarUrl={profile.avatar_url}
            otherProfiles={otherProfiles ?? []}
            onProfileSelect={handleProfileSelect}
          />

          {/* Card overlay avec info ville */}
          {profile.city ? (
            <View style={styles.mapOverlay}>
              <Text style={styles.cityLabel}>{profile.city}</Text>
            </View>
          ) : null}

          {/* BottomSheet : s'affiche seulement si un profil est sélectionné */}
          {selectedProfile && (
            <BottomSheet profile={selectedProfile} onClose={() => setSelectedProfile(null)} />
          )}
        </>
      ) : (
        // Pas de localisation : afficher le bouton
        <View style={styles.noLocationContainer}>
          <Ionicons name="location-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.noLocationTitle}>Aucune localisation définie</Text>
          <Text style={styles.noLocationText}>
            Active ta localisation pour voir les autres vanlifers sur la carte
          </Text>
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
                <Text style={styles.enableLocationText}>Activer la localisation</Text>
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
