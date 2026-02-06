import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

export const PremiumActiveCard: React.FC = () => {
  const { t } = useTranslation('settings')

  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('sections.premium.active')}</Text>
        <Text style={styles.description}>{t('sections.premium.activeDescription')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8FFF3',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
})
