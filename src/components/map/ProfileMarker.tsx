import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'
import type { NearbyProfile } from '../../types/location'

/** Deterministic offset (+-0.02° ~2.2km) based on profile UUID to prevent marker stacking */
function getPositionJitter(profileId: string): { lat: number; lng: number } {
  let hash = 0
  for (let i = 0; i < profileId.length; i++) {
    hash = ((hash << 5) - hash) + profileId.charCodeAt(i)
    hash |= 0
  }
  return {
    lat: ((hash & 0xFF) / 255 - 0.5) * 0.04,
    lng: (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.04,
  }
}

const MARKER_SIZE = 36

interface ProfileMarkerProps {
  profile: NearbyProfile
  latitude: number
  longitude: number
  onPress: () => void
}

export const ProfileMarker = memo<ProfileMarkerProps>(function ProfileMarker({
  profile,
  latitude,
  longitude,
  onPress,
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Keep tracksViewChanges=true until remote image finishes loading
  const shouldTrackChanges = !!profile.avatar_url && !imageLoaded

  // Apply deterministic jitter to spread markers in the same privacy zone
  const jitter = getPositionJitter(profile.id)

  // First letter of username for fallback
  const initial = (profile.username ?? '?').charAt(0).toUpperCase()

  return (
    <Marker
      coordinate={{ latitude: latitude + jitter.lat, longitude: longitude + jitter.lng }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={shouldTrackChanges}
    >
      <View style={styles.container}>
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            style={styles.avatar}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <Text style={styles.initial}>{initial}</Text>
        )}
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  container: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.medium,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: MARKER_SIZE / 2,
  },
  initial: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.secondary.main,
  },
})
