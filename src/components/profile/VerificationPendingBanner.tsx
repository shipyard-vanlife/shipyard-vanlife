import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { borderRadius, colors, fontSize, fontWeight, spacing } from '../../styles/theme'
import type { VerificationStatus } from '../../types/verification'

interface VerificationPendingBannerProps {
  verificationStatus: VerificationStatus | null
}

export const VerificationPendingBanner: React.FC<VerificationPendingBannerProps> = ({
  verificationStatus,
}) => {
  const { t } = useTranslation('profile')

  // Only show banner when verification is pending
  if (verificationStatus !== 'pending') {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={24} color={colors.warning} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('verificationPending.title')}</Text>
        <Text style={styles.message}>{t('verificationPending.message')}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.warning}15`,
    borderWidth: 1,
    borderColor: `${colors.warning}40`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: fontSize.sm * 1.4,
  },
})
