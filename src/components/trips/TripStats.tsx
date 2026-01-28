import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing } from '../../styles/theme'
import { formatDistance } from '../../utils/distance'

interface TripStatsProps {
  daysCount: number
  stagesCount: number
  distanceKm?: number
}

export function TripStats({ daysCount, stagesCount, distanceKm }: TripStatsProps) {
  const { t } = useTranslation('trips')

  return (
    <View style={styles.container}>
      <View style={styles.stat}>
        <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.value}>{t('card.days', { count: daysCount })}</Text>
      </View>
      <View style={styles.separator} />
      <View style={styles.stat}>
        <Ionicons name="location-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.value}>{t('card.stages', { count: stagesCount })}</Text>
      </View>
      {distanceKm !== undefined && distanceKm > 0 ? (
        <>
          <View style={styles.separator} />
          <View style={styles.stat}>
            <Ionicons name="speedometer-outline" size={16} color={colors.text.tertiary} />
            <Text style={styles.value}>{formatDistance(distanceKm, true)}</Text>
          </View>
        </>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  value: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },
  separator: {
    width: 1,
    height: 12,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
})
