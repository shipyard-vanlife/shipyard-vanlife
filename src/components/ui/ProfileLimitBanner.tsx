import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize, shadows } from '../../styles/theme'

interface ProfileLimitBannerProps {
  currentCount: number
  maxCount: number
  onUpgrade: () => void
}

export const ProfileLimitBanner: React.FC<ProfileLimitBannerProps> = ({
  currentCount,
  maxCount,
  onUpgrade,
}) => {
  const { t } = useTranslation('common')

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.left}>
          <Ionicons name="lock-closed" size={18} color={colors.secondary.main} />
          <Text style={styles.text}>
            {t('premium.profilesLimitBanner', { current: currentCount, max: maxCount })}
          </Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={onUpgrade} activeOpacity={0.7}>
          <Text style={styles.buttonText}>{t('premium.seeAllProfiles')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.secondary.main,
    ...shadows.small,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  text: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  buttonText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.white,
  },
})
