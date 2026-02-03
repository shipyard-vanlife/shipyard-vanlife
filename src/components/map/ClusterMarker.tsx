import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'

interface ClusterMarkerProps {
  id: string
  geometry: { coordinates: [number, number] }
  properties: { point_count: number; point_count_abbreviated: string }
  onPress: () => void
}

export const ClusterMarker = memo<ClusterMarkerProps>(function ClusterMarker({
  id,
  geometry,
  properties,
  onPress,
}) {
  const count = properties.point_count
  const size = getClusterSize(count)
  const innerSize = size - 5

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
      {/* White border ring */}
      <View style={[styles.borderRing, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Colored inner circle */}
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
          <Text style={[styles.count, count >= 100 ? styles.countSmall : null]}>
            {properties.point_count_abbreviated}
          </Text>
        </View>
      </View>
    </Marker>
  )
})

function getClusterSize(count: number): number {
  if (count < 10) return 38
  if (count < 50) return 44
  if (count < 100) return 50
  return 56
}

const styles = StyleSheet.create({
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  inner: {
    backgroundColor: colors.tertiary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },
  countSmall: {
    fontSize: 12,
  },
})
