import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image } from 'react-native'
import { useTranslation } from 'react-i18next'
import RNMapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps'
import { UserProfile } from '../types/user'
import { colors } from '../styles/theme'

interface MapViewProps {
  latitude: number | null
  longitude: number | null
  city: string | null
  myAvatarUrl: string | null
  otherProfiles: UserProfile[]
  onProfileSelect: (profile: UserProfile) => void
}

export const MapView: React.FC<MapViewProps> = ({
  latitude,
  longitude,
  myAvatarUrl,
  otherProfiles,
  onProfileSelect,
}) => {
  const { t } = useTranslation('home')
  const mapRef = useRef<RNMapView>(null)

  if (latitude === null || longitude === null) {
    return (
      <View style={[styles.container, styles.noLocation]}>
        <Text style={styles.noLocationText}>{t('map.noLocation')}</Text>
      </View>
    )
  }

  const profilesData = otherProfiles
    .filter(p => p.location?.latitude && p.location?.longitude)
    .map(p => ({
      id: p.id,
      username: p.username,
      lat: p.location!.latitude,
      lng: p.location!.longitude,
      avatarUrl: p.avatar_url,
      profile: p,
    }))

  // Debug
  console.log('🗺️ MapView - Total autres profils:', otherProfiles.length)
  console.log('🗺️ MapView - Profils avec coordonnées:', profilesData.length)
  if (profilesData.length > 0) {
    console.log('🗺️ MapView - Exemple profil:', profilesData[0])
  }

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
        {/* Cercle autour de ma position */}
        <Circle
          center={{ latitude, longitude }}
          radius={3000}
          fillColor={`${colors.secondary.main}26`}
          strokeColor={colors.secondary.main}
          strokeWidth={0}
        />

        {/* Mon marqueur */}
        <Marker
          coordinate={{ latitude, longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.myMarker}>
            {myAvatarUrl ? (
              <Image source={{ uri: myAvatarUrl }} style={styles.markerImage} resizeMode="cover" />
            ) : (
              <View style={styles.markerDot} />
            )}
          </View>
        </Marker>

        {/* Marqueurs des autres profils */}
        {profilesData.map(profile => (
          <Marker
            key={profile.id}
            coordinate={{ latitude: profile.lat, longitude: profile.lng }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onProfileSelect(profile.profile)}
          >
            <View style={styles.otherMarker}>
              {profile.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.otherMarkerImage} resizeMode="cover" />
              ) : (
                <View style={styles.otherMarkerDot} />
              )}
            </View>
          </Marker>
        ))}
      </RNMapView>
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
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
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
