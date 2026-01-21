import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../../styles/theme'
import { calculateDistance } from '../../../../utils/distance'
import { calculateDuration } from '../../../../utils/duration'
import type { TripStage } from '../../../../types/trip'

interface StageDetailInfoProps {
  stage: TripStage
  previousStage: TripStage | null
}

export function StageDetailInfo({ stage, previousStage }: StageDetailInfoProps) {
  const { t } = useTranslation('trips')

  // Don't show if this is the first stage
  if (!previousStage) {
    return null
  }

  const distance = calculateDistance(previousStage.location, stage.location)
  const duration = calculateDuration(previousStage.arrived_at, stage.arrived_at)

  const formatDurationText = () => {
    if (duration.days > 0) {
      return t('stageDetail.duration', { days: duration.days, hours: duration.hours })
    }
    return t('stageDetail.durationHoursOnly', { hours: duration.totalHours })
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('stageDetail.fromPrevious')}</Text>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Ionicons name="navigate-outline" size={20} color={colors.secondary.main} />
          <Text style={styles.statValue}>{t('stageDetail.distance', { km: distance })}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={colors.tertiary.main} />
          <Text style={styles.statValue}>{formatDurationText()}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border.light,
  },
})
