import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface PremiumBlurOverlayProps {
  children: React.ReactNode
  onPress: () => void
}

export const PremiumBlurOverlay: React.FC<PremiumBlurOverlayProps> = ({ children, onPress }) => {
  const { t } = useTranslation('common')

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.container}>
      <View style={styles.contentWrapper} pointerEvents="none">
        {children}
      </View>
      <BlurView intensity={25} tint="light" style={styles.blurOverlay}>
        <View style={styles.badgeContainer}>
          <Ionicons name="lock-closed" size={16} color={colors.white} />
          <Text style={styles.badgeText}>{t('premium.proBadge')}</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
  },
  contentWrapper: {
    opacity: 0.4,
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(224, 120, 86, 0.9)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  badgeText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
})
