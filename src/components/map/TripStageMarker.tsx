import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'

interface TripStageMarkerProps {
  coordinate: { latitude: number; longitude: number }
  stageNumber: number
  isFirst?: boolean
  isLast?: boolean
  onPress: () => void
}

export const TripStageMarker: React.FC<TripStageMarkerProps> = ({
  coordinate,
  stageNumber,
  isFirst = false,
  isLast = false,
  onPress,
}) => {
  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={[styles.marker, isFirst && styles.firstMarker, isLast && styles.lastMarker]}>
        <Text style={styles.number}>{stageNumber}</Text>
      </View>
    </Marker>
  )
}

const styles = StyleSheet.create({
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary.main,
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.medium,
  },
  firstMarker: {
    backgroundColor: colors.success,
  },
  lastMarker: {
    backgroundColor: colors.secondary.main,
  },
  number: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
})
