import { Ionicons } from '@expo/vector-icons'
import React, { memo, useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'

interface MyLocationMarkerProps {
  latitude: number
  longitude: number
  avatarUrl: string | null
  isVisible: boolean
}

const MARKER_SIZE = 44
const PULSE_SIZE = MARKER_SIZE + 24

export const MyLocationMarker = memo<MyLocationMarkerProps>(function MyLocationMarker({
  latitude,
  longitude,
  avatarUrl,
  isVisible,
}) {
  const [imageLoaded, setImageLoaded] = useState(false)

  // Pulse animation with standard Animated API (safe inside Marker bitmaps)
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!isVisible) return

    const animation = Animated.loop(
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    )
    animation.start()

    return () => animation.stop()
  }, [isVisible, pulseAnim])

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  })
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.35, 0],
  })

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={isVisible || (!!avatarUrl && !imageLoaded)}
    >
      <View style={styles.wrapper}>
        {/* Animated pulse ring (visible mode only) */}
        {isVisible ? (
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
            ]}
          />
        ) : null}

        {/* Static glow ring */}
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
            <Ionicons
              name="person"
              size={20}
              color={isVisible ? colors.white : colors.border.main}
            />
          )}
        </View>

        {/* Invisible badge */}
        {!isVisible ? (
          <View style={styles.invisibleBadge}>
            <Ionicons name="eye-off" size={9} color={colors.white} />
          </View>
        ) : null}
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    width: PULSE_SIZE + 8,
    height: PULSE_SIZE + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    borderRadius: PULSE_SIZE / 2,
    backgroundColor: colors.secondary.main,
  },
  glowRing: {
    position: 'absolute',
    width: MARKER_SIZE + 12,
    height: MARKER_SIZE + 12,
    borderRadius: (MARKER_SIZE + 12) / 2,
    backgroundColor: 'rgba(224, 122, 95, 0.15)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
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
  invisibleBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.text.tertiary,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
