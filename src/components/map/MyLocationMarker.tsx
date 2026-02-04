import { Ionicons } from '@expo/vector-icons'
import React, { memo, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'

interface MyLocationMarkerProps {
  latitude: number
  longitude: number
  avatarUrl: string | null
  isVisible: boolean
}

const MARKER_SIZE = 42

export const MyLocationMarker = memo<MyLocationMarkerProps>(function MyLocationMarker({
  latitude,
  longitude,
  avatarUrl,
  isVisible,
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={!!avatarUrl && !imageLoaded}
    >
      <View style={styles.wrapper}>
        {/* Static glow ring (visible mode only) */}
        {isVisible ? <View style={styles.glowRing} /> : null}

        {/* Main marker */}
        <View style={[styles.marker, !isVisible && styles.markerInvisible]}>
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              style={styles.avatar}
              resizeMode="cover"
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <View style={[styles.dot, !isVisible && styles.dotInvisible]} />
          )}
        </View>

        {/* Invisible badge */}
        {!isVisible ? (
          <View style={styles.invisibleBadge}>
            <Ionicons name="eye-off" size={10} color={colors.white} />
          </View>
        ) : null}
      </View>
    </Marker>
  )
})

const GLOW_SIZE = MARKER_SIZE + 16

const styles = StyleSheet.create({
  wrapper: {
    width: GLOW_SIZE + 8,
    height: GLOW_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    borderRadius: GLOW_SIZE / 2,
    backgroundColor: 'rgba(224, 122, 95, 0.2)',
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.secondary.main,
    borderWidth: 3,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.medium,
  },
  markerInvisible: {
    backgroundColor: colors.text.tertiary,
    borderColor: colors.border.main,
    opacity: 0.7,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: MARKER_SIZE / 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  dotInvisible: {
    backgroundColor: colors.border.main,
  },
  invisibleBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text.tertiary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
