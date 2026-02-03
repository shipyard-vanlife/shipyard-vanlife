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

export const ClusterMarker = memo<ClusterMarkerProps>(function ClusterMarker({
  id,
  geometry,
  properties,
  onPress,
}) {
  const count = properties.point_count
  const size = getClusterSize(count)
  const innerSize = size - 6
  const iconSize = count < 10 ? 12 : 14

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
      {/* Outer glow ring */}
      <View
        style={[
          styles.outerRing,
          { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 },
        ]}
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
            <Ionicons name="people" size={iconSize} color={colors.white} style={styles.icon} />
            <Text style={[styles.count, count >= 100 ? styles.countSmall : null]}>
              {properties.point_count_abbreviated}
            </Text>
          </View>
        </View>
      </View>
    </Marker>
  )
})

function getClusterSize(count: number): number {
  if (count < 10) return 42
  if (count < 50) return 50
  if (count < 100) return 58
  return 64
}

const styles = StyleSheet.create({
  outerRing: {
    backgroundColor: `${colors.secondary.main}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderRing: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
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
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 15,
  },
  countSmall: {
    fontSize: 11,
  },
})
