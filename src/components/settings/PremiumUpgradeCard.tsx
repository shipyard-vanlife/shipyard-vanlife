import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface PremiumUpgradeCardProps {
  onPress: () => void
}

export const PremiumUpgradeCard: React.FC<PremiumUpgradeCardProps> = ({ onPress }) => {
  const { t } = useTranslation('settings')

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="star" size={28} color="#E07856" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{t('sections.premium.button')}</Text>
        <Text style={styles.description}>{t('sections.premium.description')}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.text.tertiary} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E8',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
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
