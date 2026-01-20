import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

interface ProfileAboutSectionProps {
  bio: string | null
}

export const ProfileAboutSection: React.FC<ProfileAboutSectionProps> = ({ bio }) => {
  const { t } = useTranslation('profile')

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.about')}</Text>
      <Text style={styles.bio}>{bio ?? t('placeholders.noBio')}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  bio: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 22,
  },
})
