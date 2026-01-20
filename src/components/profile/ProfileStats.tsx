import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../../styles/theme'

interface ProfileStatsProps {
  distanceKm: number
  connectionsCount: number
  city: string | null
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
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

  return (
    <View style={styles.container}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>
          {formatDistance(distanceKm)}
          <Text style={styles.statUnit}> km</Text>
        </Text>
        <Text style={styles.statLabel}>{t('stats.distance')}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <Text style={styles.statValue}>{connectionsCount}</Text>
        <Text style={styles.statLabel}>{t('stats.connections')}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statItem}>
        <Text style={styles.statValue} numberOfLines={1}>
          {city ?? t('stats.notDefined')}
        </Text>
        <Text style={styles.statLabel}>{t('stats.currentLocation')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    ...shadows.small,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
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
  divider: {
    width: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.xs,
  },
})
