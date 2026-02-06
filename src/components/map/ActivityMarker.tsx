import { Ionicons } from '@expo/vector-icons'
import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors } from '../../styles/theme'
import type { Activity } from '../../types/activity'
import { ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_ICONS } from '../../types/activity'

interface ActivityMarkerProps {
  activity: Activity
  onPress: () => void
}

const MARKER_SIZE = 34

export const ActivityMarker = memo<ActivityMarkerProps>(function ActivityMarker({
  activity,
  onPress,
}) {
  const iconName = ACTIVITY_TYPE_ICONS[activity.activity_type] as keyof typeof Ionicons.glyphMap
  const bgColor = ACTIVITY_TYPE_COLORS[activity.activity_type]

  return (
    <Marker
      coordinate={{
        latitude: activity.location.latitude,
        longitude: activity.location.longitude,
      }}
      anchor={{ x: 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.wrapper}>
        {/* Subtle glow */}
        <View style={[styles.glow, { backgroundColor: bgColor + '20' }]} />

        {/* Main marker */}
        <View style={[styles.container, { backgroundColor: bgColor }]}>
          <Ionicons name={iconName} size={16} color={colors.white} />
        </View>
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  wrapper: {
    width: MARKER_SIZE + 12,
    height: MARKER_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: MARKER_SIZE + 10,
    height: MARKER_SIZE + 10,
    borderRadius: (MARKER_SIZE + 10) / 2,
  },
  container: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
})
