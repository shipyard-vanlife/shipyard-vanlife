import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'
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
  const innerSize = size - 5

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
                    i > 0 ? { marginLeft: -8 } : null,
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
            <Ionicons name="people" size={14} color={colors.white} />
          )}

          {/* Count */}
          <Text style={styles.count}>{zone.count}</Text>
        </View>
      </View>
    </Marker>
  )
})

function getBubbleSize(count: number): number {
  if (count < 20) return 44
  if (count < 50) return 50
  if (count < 100) return 56
  return 62
}

const styles = StyleSheet.create({
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
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
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
})
