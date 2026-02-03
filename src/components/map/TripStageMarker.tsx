import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'

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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary.main,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  firstMarker: {
    backgroundColor: '#4CAF50', // Green for start
  },
  lastMarker: {
    backgroundColor: colors.secondary.main, // Coral for end
  },
  number: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
})
