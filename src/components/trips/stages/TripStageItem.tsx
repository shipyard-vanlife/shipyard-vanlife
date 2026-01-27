import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import CountryFlag from 'react-native-country-flag'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../styles/theme'
import type { TripStage } from '../../../types/trip'

const FLAG_CONTAINER_SIZE = 22
const FLAG_IMAGE_SIZE = 20

interface TripStageItemProps {
  stage: TripStage
  isFirst: boolean
  isLast: boolean
  showCountryFlag?: boolean // Show flag when country changes from previous stage
  onPress?: () => void
}

export function TripStageItem({
  stage,
  isFirst,
  isLast,
  showCountryFlag = false,
  onPress,
}: TripStageItemProps) {
  const { t } = useTranslation('trips')

  const formattedDate = new Date(stage.arrived_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.timeline}>
        {!isFirst && <View style={styles.lineTop} />}
        <View style={styles.iconWrapper}>
          {showCountryFlag && stage.country ? (
            <View style={styles.flagContainer}>
              <CountryFlag isoCode={stage.country} size={FLAG_IMAGE_SIZE} />
            </View>
          ) : (
            <View style={[styles.dot, isFirst && styles.dotFirst]} />
          )}
        </View>
        {!isLast && <View style={styles.lineBottom} />}
      </View>

      {/* Content */}
      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.orderBadge}>
          <Text style={styles.orderText}>{stage.stage_order}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.city}>{stage.city ?? t('card.noCity')}</Text>
          <Text style={styles.date}>{t('stage.arrivedAt', { date: formattedDate })}</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  timeline: {
    width: 24,
    alignItems: 'center',
  },
  lineTop: {
    width: 2,
    height: 4,
    backgroundColor: colors.border.main,
  },
  lineBottom: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.main,
  },
  iconWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.tertiary.main,
    borderWidth: 2,
    borderColor: colors.white,
  },
  dotFirst: {
    backgroundColor: colors.secondary.main,
    width: 14,
    height: 14,
  },
  flagContainer: {
    width: FLAG_CONTAINER_SIZE,
    height: FLAG_CONTAINER_SIZE,
    borderRadius: FLAG_CONTAINER_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  orderText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  info: {
    flex: 1,
  },
  city: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
})
