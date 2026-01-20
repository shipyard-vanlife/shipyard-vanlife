import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface ProfileActionButtonProps {
  onPress: () => void
}

export const ProfileActionButton: React.FC<ProfileActionButtonProps> = ({ onPress }) => {
  const { t } = useTranslation('profile')

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.buttonText}>{t('actions.viewTrip')}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.text.primary,
    marginHorizontal: spacing.xl,
    marginVertical: spacing.lg,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
})
