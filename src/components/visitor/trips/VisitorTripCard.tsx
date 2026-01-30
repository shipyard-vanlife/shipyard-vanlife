import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CountryFlag from 'react-native-country-flag'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../../styles/theme'
import { formatMonthYear } from '../../../utils/formatDate'
import type { PublicTrip } from '../../../types/trip'

const CARD_WIDTH = 160
const CARD_HEIGHT = 180
const MAX_FLAGS = 3
const FLAG_SIZE = 16

interface VisitorTripCardProps {
  trip: PublicTrip
  onPress: () => void
}

export function VisitorTripCard({ trip, onPress }: VisitorTripCardProps) {
  const { t } = useTranslation('trips')

  // Format dates in short format
  const dateRange = useMemo(() => {
    const startStr = formatMonthYear(trip.start_date)
    if (trip.end_date) {
      const endStr = formatMonthYear(trip.end_date)
      return `${startStr} - ${endStr}`
    }
    return startStr
  }, [trip.start_date, trip.end_date])

  // Extract unique country codes from stages
  const countryCodes = useMemo(() => {
    if (!trip.stages || trip.stages.length === 0) return []

    const seen = new Set<string>()
    const codes: string[] = []

    for (const stage of trip.stages) {
      if (stage.country && !seen.has(stage.country)) {
        seen.add(stage.country)
        codes.push(stage.country)
        if (codes.length >= MAX_FLAGS) break
      }
    }

    return codes
  }, [trip.stages])

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Header with icon */}
      <View style={styles.iconContainer}>
        <Ionicons
          name={trip.is_active ? 'navigate' : 'map'}
          size={32}
          color={trip.is_active ? colors.secondary.main : colors.tertiary.main}
        />
      </View>

      {/* Trip name */}
      <Text style={styles.name} numberOfLines={2}>
        {trip.name}
      </Text>

      {/* Active badge */}
      {trip.is_active ? (
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>{t('visitor.ongoing')}</Text>
        </View>
      ) : null}

      {/* Country flags */}
      {countryCodes.length > 0 ? (
        <View style={styles.flagsRow}>
          {countryCodes.map(code => (
            <View key={code} style={styles.flagContainer}>
              <CountryFlag isoCode={code} size={FLAG_SIZE} />
            </View>
          ))}
        </View>
      ) : null}

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Ionicons name="location-outline" size={12} color={colors.text.muted} />
          <Text style={styles.statText}>{trip.stages_count}</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="calendar-outline" size={12} color={colors.text.muted} />
          <Text style={styles.statText}>{trip.days_count}j</Text>
        </View>
      </View>

      {/* Date range */}
      <Text style={styles.dateText} numberOfLines={1}>
        {dateRange}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    lineHeight: fontSize.sm * 1.3,
  },
  activeBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.success,
  },
  flagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  dateText: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
})
