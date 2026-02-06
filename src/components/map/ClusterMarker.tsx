import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'

interface ClusterMarkerProps {
  id: string
  geometry: { coordinates: [number, number] }
  properties: { point_count: number; point_count_abbreviated: string }
  onPress: () => void
}

/** Smooth logarithmic sizing instead of abrupt steps */
function getClusterSize(count: number): number {
  const minSize = 40
  const maxSize = 68
  const scale = Math.min(Math.log2(count) / Math.log2(200), 1)
  return Math.round(minSize + (maxSize - minSize) * scale)
}

/** Slightly darker coral as cluster grows */
function getClusterOpacity(count: number): number {
  if (count < 10) return 0.85
  if (count < 50) return 0.9
  return 1
}

export const ClusterMarker = memo<ClusterMarkerProps>(function ClusterMarker({
  id,
  geometry,
  properties,
  onPress,
}) {
  const count = properties.point_count
  const size = getClusterSize(count)
  const innerSize = size - 6
  const glowSize = size + 10
  const opacity = getClusterOpacity(count)
  const iconSize = size < 44 ? 11 : 13
  const countSize = count >= 100 ? 10 : 12

  return (
    <Marker
      key={`cluster-${id}`}
      coordinate={{
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.wrapper, { width: glowSize + 4, height: glowSize + 4 }]}>
        {/* Outer glow ring */}
        <View
          style={[
            styles.outerRing,
            { width: glowSize, height: glowSize, borderRadius: glowSize / 2 },
          ]}
        />

        {/* White border ring */}
        <View
          style={[
            styles.borderRing,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          {/* Colored inner circle */}
          <View
            style={[
              styles.inner,
              {
                width: innerSize,
                height: innerSize,
                borderRadius: innerSize / 2,
                opacity,
              },
            ]}
          >
            <Ionicons name="people" size={iconSize} color={colors.white} style={styles.icon} />
            <Text style={[styles.count, { fontSize: countSize }]}>
              {properties.point_count_abbreviated}
            </Text>
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
  outerRing: {
    position: 'absolute',
    backgroundColor: `${colors.secondary.main}1A`,
  },
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 5,
  },
  inner: {
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: -2,
  },
  count: {
    color: colors.white,
    fontWeight: '800',
    lineHeight: 14,
  },
})
