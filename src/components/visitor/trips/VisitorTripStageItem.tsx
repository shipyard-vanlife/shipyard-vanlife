import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CountryFlag from 'react-native-country-flag'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../styles/theme'
import { formatDateShort } from '../../../utils/formatDate'
import type { PublicTripStage } from '../../../types/trip'

const FLAG_SIZE = 20

interface VisitorTripStageItemProps {
  stage: PublicTripStage
  index: number
  isFirst: boolean
  isLast: boolean
  showCountryFlag: boolean
  onViewOnMap?: () => void
}

export function VisitorTripStageItem({
  stage,
  index,
  isFirst,
  isLast,
  showCountryFlag,
  onViewOnMap,
}: VisitorTripStageItemProps) {
  const { t } = useTranslation('trips')

  // Format date
  const dateStr = formatDateShort(stage.arrived_at)

  // Build location text
  const locationText = [stage.city, stage.country].filter(Boolean).join(', ')

  return (
    <View style={styles.container}>
      {/* Timeline */}
      <View style={styles.timeline}>
        {/* Top line */}
        {!isFirst ? <View style={styles.timelineLine} /> : <View style={styles.timelineSpacer} />}

        {/* Dot */}
        <View style={[styles.timelineDot, isFirst && styles.timelineDotFirst]}>
          <Text style={styles.stageNumber}>{index + 1}</Text>
        </View>

        {/* Bottom line */}
        {!isLast ? <View style={styles.timelineLine} /> : <View style={styles.timelineSpacer} />}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header with country flag */}
        <View style={styles.header}>
          {showCountryFlag && stage.country ? (
            <View style={styles.flagContainer}>
              <CountryFlag isoCode={stage.country} size={FLAG_SIZE} />
            </View>
          ) : null}
          <Text style={styles.date}>{dateStr}</Text>
        </View>

        {/* Location */}
        <Text style={styles.location} numberOfLines={1}>
          {locationText || t('visitor.gpsPosition')}
        </Text>

        {/* View on map button */}
        {onViewOnMap ? (
          <TouchableOpacity style={styles.mapButton} onPress={onViewOnMap} activeOpacity={0.7}>
            <Ionicons name="map-outline" size={14} color={colors.secondary.main} />
            <Text style={styles.mapButtonText}>{t('visitor.viewOnMap')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    minHeight: 80,
  },
  timeline: {
    width: 32,
    alignItems: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.border.main,
  },
  timelineSpacer: {
    flex: 1,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.tertiary.light,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.main,
  },
  timelineDotFirst: {
    backgroundColor: colors.secondary.main,
    borderColor: colors.secondary.main,
  },
  stageNumber: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingLeft: spacing.md,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  flagContainer: {
    width: FLAG_SIZE + 2,
    height: FLAG_SIZE + 2,
    borderRadius: (FLAG_SIZE + 2) / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  location: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.secondary.main + '15',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.secondary.main,
  },
})
