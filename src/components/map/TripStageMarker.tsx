import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'

interface TripStageMarkerProps {
  coordinate: { latitude: number; longitude: number }
  stageNumber: number
  isFirst?: boolean
  isLast?: boolean
  onPress: () => void
}

const MARKER_SIZE = 34
const POINTER_SIZE = 8

export const TripStageMarker = memo<TripStageMarkerProps>(function TripStageMarker({
  coordinate,
  stageNumber,
  isFirst = false,
  isLast = false,
  onPress,
}) {
  const bgColor = isFirst ? '#4CAF50' : isLast ? colors.secondary.main : colors.tertiary.main

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 1 }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.wrapper}>
        {/* Main circle */}
        <View style={[styles.outerRing, { backgroundColor: bgColor + '20' }]}>
          <View style={[styles.marker, { backgroundColor: bgColor }]}>
            {isFirst ? (
              <Ionicons name="flag" size={14} color={colors.white} />
            ) : isLast ? (
              <Ionicons name="location" size={14} color={colors.white} />
            ) : (
              <Text style={styles.number}>{stageNumber}</Text>
            )}
          </View>
        </View>

        {/* Pointer */}
        <View style={[styles.pointer, { borderTopColor: colors.white }]} />
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  outerRing: {
    width: MARKER_SIZE + 8,
    height: MARKER_SIZE + 8,
    borderRadius: (MARKER_SIZE + 8) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  number: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: POINTER_SIZE / 2,
    borderRightWidth: POINTER_SIZE / 2,
    borderTopWidth: POINTER_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
})
