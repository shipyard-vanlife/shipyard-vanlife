import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../styles/theme'
import { convertDistance, getDistanceUnit } from '../../utils/distance'
import { formatNumber } from '../../utils/formatting'

interface ProfileStatsProps {
  daysOnRoad: number
  distanceKm?: number // Optional - not available for visitor profiles
  connectionsCount: number
  city: string | null
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  daysOnRoad,
  distanceKm,
  connectionsCount,
  city,
}) => {
  const { t } = useTranslation('profile')

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <View style={[styles.card, styles.cardLeft]}>
          <Text style={styles.value}>
            {formatNumber(daysOnRoad)}
            <Text style={styles.unit}> {t('stats.daysUnit')}</Text>
          </Text>
          <Text style={styles.label}>{t('stats.daysOnRoad')}</Text>
        </View>

        <View style={[styles.card, styles.cardRight]}>
          <Text style={styles.value}>{formatNumber(connectionsCount)}</Text>
          <Text style={styles.label}>{t('stats.connections')}</Text>
        </View>
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        <View style={[styles.card, styles.cardLeft]}>
          <Text style={styles.value}>
            {distanceKm !== undefined ? (
              <>
                {formatNumber(Math.round(convertDistance(distanceKm)))}
                <Text style={styles.unit}> {getDistanceUnit()}</Text>
              </>
            ) : (
              '—'
            )}
          </Text>
          <Text style={styles.label}>{t('stats.distance')}</Text>
        </View>

        <View style={[styles.card, styles.cardRight, styles.locationCard]}>
          <View style={styles.locationContent}>
            <View style={styles.locationIconWrapper}>
              <Ionicons name="location" size={18} color={colors.tertiary.main} />
            </View>
            <Text style={styles.locationValue} numberOfLines={1}>
              {city ?? t('stats.notDefined')}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  cardLeft: {},
  cardRight: {},
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.tertiary,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  locationCard: {
    justifyContent: 'center',
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  locationIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.tertiary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
})
