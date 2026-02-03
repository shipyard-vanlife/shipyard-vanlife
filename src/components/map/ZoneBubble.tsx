import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'
import type { MapZone } from '../../types/location'

/** Max sample avatars shown inside the bubble */
const MAX_AVATARS = 3

interface ZoneBubbleProps {
  zone: MapZone
  onPress: () => void
}

export const ZoneBubble = memo<ZoneBubbleProps>(function ZoneBubble({ zone, onPress }) {
  const [imagesLoaded, setImagesLoaded] = useState(0)

  // Use pre-fetched sample avatar URLs from DB (up to 3)
  const avatarUrls = zone.sampleAvatars.slice(0, MAX_AVATARS)
  const shouldTrackChanges = avatarUrls.length > 0 && imagesLoaded < avatarUrls.length

  const size = getBubbleSize(zone.count)
  const innerSize = size - 6

  return (
    <Marker
      coordinate={{
        latitude: zone.center.latitude,
        longitude: zone.center.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={shouldTrackChanges}
    >
      {/* Outer glow */}
      <View
        style={[
          styles.outerGlow,
          { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 },
        ]}
      >
        {/* White border ring */}
        <View style={[styles.borderRing, { width: size, height: size, borderRadius: size / 2 }]}>
          {/* Inner coral circle */}
          <View
            style={[
              styles.inner,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
              },
            ]}
          >
            {/* Sample avatars row */}
            {avatarUrls.length > 0 ? (
              <View style={styles.avatarsRow}>
                {avatarUrls.map((url, i) => (
                  <View
                    key={url}
                    style={[
                      styles.miniAvatarContainer,
                      i > 0 ? { marginLeft: -6 } : null,
                      { zIndex: MAX_AVATARS - i },
                    ]}
                  >
                    <Image
                      source={{ uri: url }}
                      style={styles.miniAvatar}
                      resizeMode="cover"
                      onLoad={() => setImagesLoaded(prev => prev + 1)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <Ionicons name="people" size={16} color={colors.white} />
            )}

            {/* Count badge */}
            <Text style={styles.count}>{zone.count}</Text>
          </View>
        </View>
      </View>
    </Marker>
  )
})

function getBubbleSize(count: number): number {
  if (count < 20) return 52
  if (count < 50) return 60
  if (count < 100) return 68
  return 76
}

const styles = StyleSheet.create({
  outerGlow: {
    backgroundColor: `${colors.secondary.main}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  inner: {
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.white,
    overflow: 'hidden',
    backgroundColor: colors.tertiary.main,
  },
  miniAvatar: {
    width: '100%',
    height: '100%',
  },
  count: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
})
