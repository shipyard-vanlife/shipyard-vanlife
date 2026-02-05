import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'
import type { MapZone } from '../../types/location'

interface ZoneBubbleProps {
  zone: MapZone
  onPress: () => void
}

/**
 * Smooth sizing with a good minimum for small counts (2-3).
 * count=2 → 46px, count=5 → 50px, count=20 → 58px, count=100+ → 72px
 */
function getBubbleSize(count: number): number {
  if (count <= 1) return 44
  const minSize = 46
  const maxSize = 72
  const scale = Math.min(Math.log2(count) / Math.log2(200), 1)
  return Math.round(minSize + (maxSize - minSize) * scale)
}

/** For small counts (2-5), show fewer/no avatars to keep it clean */
function getMaxAvatars(count: number): number {
  if (count <= 3) return 2
  return 3
}

export const ZoneBubble = memo<ZoneBubbleProps>(function ZoneBubble({ zone, onPress }) {
  const [imagesLoaded, setImagesLoaded] = useState(0)

  const maxAvatars = getMaxAvatars(zone.count)
  const avatarUrls = zone.sampleAvatars.slice(0, maxAvatars)
  const shouldTrackChanges = avatarUrls.length > 0 && imagesLoaded < avatarUrls.length

  const size = getBubbleSize(zone.count)
  const innerSize = size - 6
  const glowSize = size + 12
  const isSmall = zone.count <= 5

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
      <View
        style={[
          styles.wrapper,
          { width: glowSize + 4, height: glowSize + 4 },
        ]}
      >
        {/* Outer glow */}
        <View
          style={[
            styles.outerGlow,
            { width: glowSize, height: glowSize, borderRadius: glowSize / 2 },
          ]}
        />

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
            {/* Small counts: just icon + count, no avatars */}
            {isSmall ? (
              <>
                <Ionicons name="people" size={14} color={colors.white} />
                <Text style={styles.countSmall}>{zone.count}</Text>
              </>
            ) : (
              <>
                {/* Sample avatars row */}
                {avatarUrls.length > 0 ? (
                  <View style={styles.avatarsRow}>
                    {avatarUrls.map((url, i) => (
                      <View
                        key={url}
                        style={[
                          styles.miniAvatarContainer,
                          i > 0 ? { marginLeft: -5 } : null,
                          { zIndex: maxAvatars - i },
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
              </>
            )}
          </View>
        </View>
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerGlow: {
    position: 'absolute',
    backgroundColor: `${colors.secondary.main}18`,
  },
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
    width: 18,
    height: 18,
    borderRadius: 9,
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
  countSmall: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '800',
    lineHeight: 13,
  },
})
