import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Image, StyleSheet, Text, View } from 'react-native'
import RNMapView, { Circle, Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps'
import { colors } from '../styles/theme'
import { NearbyProfile } from '../types/location'
import { TripOverlayData, TripOverlayStage } from '../types/map'
import { TripMapOverlay } from './map/TripMapOverlay'
import { TripStageMarker } from './map/TripStageMarker'

interface MapViewProps {
  latitude: number | null
  longitude: number | null
  city: string | null
  myAvatarUrl: string | null
  isProfileVisible?: boolean // Whether the user's profile is visible to others
  otherProfiles: NearbyProfile[] // BLURRED coordinates via zone_center
  onProfileSelect: (profile: NearbyProfile) => void
  // Trip overlay props
  tripOverlay?: TripOverlayData | null
  onTripOverlayClose?: () => void
  onStagePress?: (stage: TripOverlayStage) => void
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  myAvatarUrl,
  isProfileVisible = true,
  otherProfiles,
  onProfileSelect,
  tripOverlay,
  onTripOverlayClose,
  onStagePress,
}) => {
  const { t } = useTranslation('home')
  const mapRef = useRef<RNMapView>(null)

  // Zoom to fit trip stages when tripOverlay is set
  useEffect(() => {
    if (tripOverlay && mapRef.current && tripOverlay.stages.length > 0) {
      const coordinates = tripOverlay.stages.map(s => ({
        latitude: s.latitude,
        longitude: s.longitude,
      }))
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 150, right: 50, bottom: 100, left: 50 },
        animated: true,
      })
    }
  }, [tripOverlay])

  // Animate to a specific stage and open its detail
  const handleStageSelect = (stage: TripOverlayStage) => {
    // Animate map to the selected stage
    mapRef.current?.animateToRegion(
      {
        latitude: stage.latitude,
        longitude: stage.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      300
    )
    // Then call the original callback to open the modal
    onStagePress?.(stage)
  }

  if (latitude === null || longitude === null) {
    return (
      <View style={[styles.container, styles.noLocation]}>
        <Text style={styles.noLocationText}>{t('map.noLocation')}</Text>
      </View>
    )
  }

  // Use zone_center (BLURRED coordinates) for other users' markers
  const profilesData = otherProfiles
    .filter(p => p.zone_center?.latitude && p.zone_center?.longitude)
    .map(p => ({
      id: p.id,
      username: p.username,
      lat: p.zone_center!.latitude,
      lng: p.zone_center!.longitude,
      avatarUrl: p.avatar_url,
      profile: p,
    }))

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        }}
        minZoomLevel={2}
        maxZoomLevel={20}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Cercle autour de ma position (masqué quand un trip est affiché) */}
        {!tripOverlay && (
          <Circle
            center={{ latitude, longitude }}
            radius={3000}
            fillColor={`${colors.secondary.main}26`}
            strokeColor={colors.secondary.main}
            strokeWidth={0}
          />
        )}

        {/* Mon marqueur (masqué quand un trip est affiché) */}
        {!tripOverlay && (
          <Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.myMarkerContainer}>
              <View style={[styles.myMarker, !isProfileVisible && styles.myMarkerInvisible]}>
                {myAvatarUrl ? (
                  <Image
                    source={{ uri: myAvatarUrl }}
                    style={[styles.markerImage, !isProfileVisible && styles.markerImageInvisible]}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[styles.markerDot, !isProfileVisible && styles.markerDotInvisible]}
                  />
                )}
              </View>
              {/* Badge d'invisibilité */}
              {!isProfileVisible && (
                <View style={styles.invisibleBadge}>
                  <Ionicons name="eye-off" size={12} color={colors.white} />
                </View>
              )}
            </View>
          </Marker>
        )}

        {/* Marqueurs des autres profils (masqués quand un trip est affiché) */}
        {!tripOverlay &&
          profilesData.map(profile => (
            <Marker
              key={profile.id}
              coordinate={{ latitude: profile.lat, longitude: profile.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              onPress={() => onProfileSelect(profile.profile)}
            >
              <View style={styles.otherMarker}>
                {profile.avatarUrl ? (
                  <Image
                    source={{ uri: profile.avatarUrl }}
                    style={styles.otherMarkerImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.otherMarkerDot} />
                )}
              </View>
            </Marker>
          ))}

        {/* Trip Polyline - ligne connectant les étapes */}
        {tripOverlay && tripOverlay.stages.length > 1 && (
          <Polyline
            coordinates={tripOverlay.stages.map(s => ({
              latitude: s.latitude,
              longitude: s.longitude,
            }))}
            strokeColor={colors.secondary.main}
            strokeWidth={3}
          />
        )}

        {/* Trip Stage Markers - marqueurs numérotés pour chaque étape */}
        {tripOverlay?.stages.map((stage, index) => (
          <TripStageMarker
            key={stage.id}
            coordinate={{ latitude: stage.latitude, longitude: stage.longitude }}
            stageNumber={stage.stageOrder}
            isFirst={index === 0}
            isLast={index === tripOverlay.stages.length - 1}
            onPress={() => onStagePress?.(stage)}
          />
        ))}
      </RNMapView>

      {/* Trip Map Overlay - card info flottante avec liste déroulante */}
      {tripOverlay && (
        <TripMapOverlay
          tripName={tripOverlay.tripName}
          stagesCount={tripOverlay.stagesCount}
          totalDistanceKm={tripOverlay.totalDistanceKm}
          stages={tripOverlay.stages}
          onStageSelect={handleStageSelect}
          onClose={onTripOverlayClose}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  map: {
    flex: 1,
  },
  noLocation: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  myMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  myMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary.main,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  myMarkerInvisible: {
    backgroundColor: colors.text.tertiary,
    borderColor: colors.border.main,
    opacity: 0.7,
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  markerImageInvisible: {
    opacity: 0.5,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  markerDotInvisible: {
    backgroundColor: colors.border.main,
  },
  invisibleBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.text.tertiary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tertiary.main,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  otherMarkerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  otherMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
})
