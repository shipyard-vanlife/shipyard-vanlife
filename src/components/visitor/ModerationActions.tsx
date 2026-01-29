import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

interface ModerationActionsProps {
  onReport: () => void
  onBlock: () => void
}

export const ModerationActions: React.FC<ModerationActionsProps> = ({ onReport, onBlock }) => {
  const { t } = useTranslation('common')

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.actionButton} onPress={onReport} activeOpacity={0.7}>
        <Ionicons name="flag-outline" size={18} color={colors.text.tertiary} />
        <Text style={styles.actionText}>{t('moderation.reportProfile')}</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      <TouchableOpacity style={styles.actionButton} onPress={onBlock} activeOpacity={0.7}>
        <Ionicons name="ban-outline" size={18} color={colors.error} />
        <Text style={[styles.actionText, styles.blockText]}>{t('moderation.blockUser')}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontWeight: fontWeight.medium,
  },
  blockText: {
    color: colors.error,
  },
  separator: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
})
