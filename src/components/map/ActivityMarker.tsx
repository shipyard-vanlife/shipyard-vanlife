import { Ionicons } from '@expo/vector-icons'
import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Marker } from 'react-native-maps'
import { colors, shadows } from '../../styles/theme'
import type { Activity } from '../../types/activity'
import { ACTIVITY_TYPE_COLORS, ACTIVITY_TYPE_ICONS } from '../../types/activity'

interface ActivityMarkerProps {
  activity: Activity
  onPress: () => void
}

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
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <Ionicons name={iconName} size={18} color={colors.white} />
      </View>
    </Marker>
  )
})

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2.5,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
})
