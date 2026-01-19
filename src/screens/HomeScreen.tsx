import React from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { BottomSheet } from '../components/BottomSheet'
import { MapView } from '../components/MapView'
import { useMyProfile } from '../hooks/useProfiles'

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation('common')
  const { data: profile, isLoading } = useMyProfile()

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E07A5F" />
      </View>
    )
  }

  // Sécurité : ne devrait pas arriver car vérifié dans AuthenticatedApp
  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>{t('errors.profileNotFound')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Carte interactive avec Leaflet */}
      <MapView
        latitude={profile.location?.latitude ?? null}
        longitude={profile.location?.longitude ?? null}
        city={profile.city}
      />

      {/* Card overlay avec info ville */}
      {profile.city ? (
        <View style={styles.mapOverlay}>
          <Text style={styles.cityLabel}>{profile.city}</Text>
        </View>
      ) : null}

      <BottomSheet profile={profile} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
})
