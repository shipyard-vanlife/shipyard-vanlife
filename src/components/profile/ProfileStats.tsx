import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from '../../styles/theme'

interface ProfileStatsProps {
  daysOnRoad: number
  distanceKm: number
  connectionsCount: number
  city: string | null
}

interface StatItemProps {
  value: string | number
  label: string
  unit?: string
}

const StatItem: React.FC<StatItemProps> = ({ value, label, unit }) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>
      {value}
      {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
)

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  daysOnRoad,
  distanceKm,
  connectionsCount,
  city,
}) => {
  const { t } = useTranslation('profile')

  const formatDistance = (km: number): string => {
    if (km >= 1000) {
      return km.toLocaleString('fr-FR')
    }
    return km.toString()
  }

  const formatDays = (days: number): string => {
    return days.toLocaleString('fr-FR')
  }

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        <View style={[styles.cell, styles.cellTopLeft]}>
          <StatItem
            value={formatDays(daysOnRoad)}
            label={t('stats.daysOnRoad')}
            unit={t('stats.daysUnit')}
          />
        </View>
        <View style={styles.verticalDivider} />
        <View style={[styles.cell, styles.cellTopRight]}>
          <StatItem value={connectionsCount} label={t('stats.connections')} />
        </View>
      </View>

      <View style={styles.horizontalDivider} />

      {/* Row 2 */}
      <View style={styles.row}>
        <View style={[styles.cell, styles.cellBottomLeft]}>
          <StatItem
            value={formatDistance(distanceKm)}
            label={t('stats.distance')}
            unit="km"
          />
        </View>
        <View style={styles.verticalDivider} />
        <View style={[styles.cell, styles.cellBottomRight]}>
          <StatItem
            value={city ?? t('stats.notDefined')}
            label={t('stats.location')}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  cellTopLeft: {},
  cellTopRight: {},
  cellBottomLeft: {},
  cellBottomRight: {},
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statUnit: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    color: colors.text.tertiary,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  verticalDivider: {
    width: 1,
    backgroundColor: colors.border.light,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
})
