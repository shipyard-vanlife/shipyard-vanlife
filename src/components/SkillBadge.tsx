import React, { memo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SkillBadge as SkillBadgeType, SKILL_COLORS } from '../types/user'
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme'

interface SkillBadgeProps {
  skill: SkillBadgeType
  isMain?: boolean
}

export const SkillBadge = memo(function SkillBadge({ skill, isMain = false }: SkillBadgeProps) {
  const { t } = useTranslation('skills')
  const color = SKILL_COLORS[skill]

  return (
    <View style={[styles.badge, { backgroundColor: color }, isMain && styles.mainBadge]}>
      <Text style={[styles.label, isMain && styles.mainLabel]}>{t(skill)}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.xl,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  mainBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  label: {
    color: colors.white,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  mainLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
  },
})
