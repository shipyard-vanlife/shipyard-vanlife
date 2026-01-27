import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import CountryFlag from 'react-native-country-flag'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../../styles/theme'

const FLAG_SIZE = 28

interface StageDetailHeaderProps {
  stageNumber: number
  city: string | null
  country: string | null
  arrivedAt: string
}

export function StageDetailHeader({
  stageNumber,
  city,
  country,
  arrivedAt,
}: StageDetailHeaderProps) {
  const { t } = useTranslation('trips')

  const formattedDate = new Date(arrivedAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        <View style={styles.stageBadge}>
          <Text style={styles.stageBadgeText}>{stageNumber}</Text>
        </View>
        {country ? (
          <View style={styles.flagContainer}>
            <CountryFlag isoCode={country} size={FLAG_SIZE} />
          </View>
        ) : null}
      </View>

      <View style={styles.locationRow}>
        <Ionicons name="location" size={20} color={colors.secondary.main} />
        <Text style={styles.cityText}>{city ?? t('card.noCity')}</Text>
      </View>

      <View style={styles.dateRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.text.tertiary} />
        <Text style={styles.dateText}>
          {t('stageDetail.arrivalDate')}: {formattedDate}
        </Text>
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
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  stageBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageBadgeText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  flagContainer: {
    width: FLAG_SIZE + 4,
    height: FLAG_SIZE + 4,
    borderRadius: (FLAG_SIZE + 4) / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cityText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
})
