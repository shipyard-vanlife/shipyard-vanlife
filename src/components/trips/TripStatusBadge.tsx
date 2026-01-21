import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

interface TripStatusBadgeProps {
  isActive: boolean
}

export function TripStatusBadge({ isActive }: TripStatusBadgeProps) {
  const { t } = useTranslation('trips')

  return (
    <View style={[styles.badge, isActive ? styles.activeBadge : styles.endedBadge]}>
      <Text style={[styles.text, isActive ? styles.activeText : styles.endedText]}>
        {isActive ? t('card.active') : t('card.ended')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  activeBadge: {
    backgroundColor: colors.success + '20',
  },
  endedBadge: {
    backgroundColor: colors.text.muted + '20',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  activeText: {
    color: colors.success,
  },
  endedText: {
    color: colors.text.muted,
  },
})
