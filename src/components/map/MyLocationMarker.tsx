import { Ionicons } from '@expo/vector-icons'
import React, { memo, useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'

interface MyLocationMarkerProps {
  latitude: number
  longitude: number
  avatarUrl: string | null
  isVisible: boolean
}

const MARKER_SIZE = 42
const PULSE_SIZE = MARKER_SIZE + 24

export const MyLocationMarker = memo<MyLocationMarkerProps>(function MyLocationMarker({
  latitude,
  longitude,
  avatarUrl,
  isVisible,
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const pulseAnim = useRef(new Animated.Value(0)).current

  // Keep tracksViewChanges=true until remote image finishes loading
  const shouldTrackChanges = !!avatarUrl && !imageLoaded

  // Pulsing ring animation
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
    outputRange: [0.4, 0],
  })

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={shouldTrackChanges}
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

const styles = StyleSheet.create({
  wrapper: {
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: MARKER_SIZE + 16,
    height: MARKER_SIZE + 16,
    borderRadius: (MARKER_SIZE + 16) / 2,
    backgroundColor: colors.secondary.main,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: colors.white,
    borderWidth: 2.5,
    borderColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadows.medium,
  },
  markerInvisible: {
    backgroundColor: colors.primary.dark,
    borderColor: colors.border.main,
    opacity: 0.5,
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
    backgroundColor: colors.secondary.main,
  },
  dotInvisible: {
    backgroundColor: colors.border.main,
  },
  invisibleBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
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
