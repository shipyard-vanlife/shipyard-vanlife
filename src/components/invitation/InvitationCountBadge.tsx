import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme'

interface InvitationCountBadgeProps {
  count: number
  size?: 'small' | 'medium'
}

export const InvitationCountBadge: React.FC<InvitationCountBadgeProps> = ({
  count,
  size = 'medium',
}) => {
  const { t } = useTranslation(['invitation'])

  const isSmall = size === 'small'

  return (
    <View style={[styles.container, isSmall && styles.containerSmall]}>
      <Text style={[styles.count, isSmall && styles.countSmall]}>{count}</Text>
      <Text style={[styles.label, isSmall && styles.labelSmall]}>
        {t('invitation:section.invitedCount', { count })}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary.main}15`,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  containerSmall: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
  },
  count: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.secondary.main,
  },
  countSmall: {
    fontSize: fontSize.sm,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.secondary.main,
  },
  labelSmall: {
    fontSize: fontSize.xs,
  },
})

export default InvitationCountBadge
