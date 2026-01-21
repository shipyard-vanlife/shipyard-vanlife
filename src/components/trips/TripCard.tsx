import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import CountryFlag from 'react-native-country-flag'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme'
import type { Trip } from '../../types/trip'
import { TripStatusBadge } from './TripStatusBadge'
import { TripStats } from './TripStats'

const MAX_FLAGS_DISPLAY = 4
const FLAG_CONTAINER_SIZE = 22
const FLAG_IMAGE_SIZE = 20

interface TripCardProps {
  trip: Trip
  onPress: () => void
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const startDate = new Date(trip.start_date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const endDate = trip.end_date
    ? new Date(trip.end_date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  // Get first stage city as starting point
  const startCity = trip.stages?.[0]?.city ?? null
  // Get last stage city as current/end point
  const lastCity = trip.stages?.length > 1 ? trip.stages[trip.stages.length - 1]?.city : null

  // Extract unique country codes from stages (in order of first visit)
  const countryData = useMemo(() => {
    if (!trip.stages || trip.stages.length === 0) return { codes: [], overflow: 0 }

    const seenCountries = new Set<string>()
    const codes: string[] = []

    for (const stage of trip.stages) {
      if (stage.country && !seenCountries.has(stage.country)) {
        seenCountries.add(stage.country)
        codes.push(stage.country)
      }
    }

    const displayCodes = codes.slice(0, MAX_FLAGS_DISPLAY)
    const overflow = codes.length - MAX_FLAGS_DISPLAY

    return { codes: displayCodes, overflow: overflow > 0 ? overflow : 0 }
  }, [trip.stages])

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      {/* Header with name and status */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons
            name={trip.is_active ? 'navigate' : 'flag'}
            size={20}
            color={trip.is_active ? colors.secondary.main : colors.text.muted}
          />
          <Text style={styles.name} numberOfLines={1}>
            {trip.name}
          </Text>
        </View>
        <TripStatusBadge isActive={trip.is_active} />
      </View>

      {/* Location info */}
      <View style={styles.locationRow}>
        <Ionicons name="location" size={14} color={colors.text.tertiary} />
        <Text style={styles.locationText} numberOfLines={1}>
          {startCity ?? 'Position GPS'}
          {lastCity ? ` → ${lastCity}` : ''}
        </Text>
      </View>

      {/* Date range */}
      <View style={styles.dateRow}>
        <Ionicons name="calendar" size={14} color={colors.text.tertiary} />
        <Text style={styles.dateText}>
          {startDate}
          {endDate ? ` - ${endDate}` : ' - En cours'}
        </Text>
      </View>

      {/* Country flags */}
      {countryData.codes.length > 0 ? (
        <View style={styles.flagsRow}>
          {countryData.codes.map((code) => (
            <View key={code} style={styles.flagContainer}>
              <CountryFlag isoCode={code} size={FLAG_IMAGE_SIZE} />
            </View>
          ))}
          {countryData.overflow > 0 ? (
            <Text style={styles.flagOverflow}>+{countryData.overflow}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Stats row */}
      <View style={styles.statsRow}>
        <TripStats
          daysCount={trip.days_count}
          stagesCount={trip.stages_count}
          distanceKm={trip.total_distance_km}
        />
        <Ionicons name="chevron-forward" size={20} color={colors.text.muted} />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  locationText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  flagContainer: {
    width: FLAG_CONTAINER_SIZE,
    height: FLAG_CONTAINER_SIZE,
    borderRadius: FLAG_CONTAINER_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagOverflow: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginLeft: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
})
