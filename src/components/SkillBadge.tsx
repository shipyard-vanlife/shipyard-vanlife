import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { SkillBadge as SkillBadgeType, SKILL_COLORS } from '../types/user'

interface SkillBadgeProps {
  skill: SkillBadgeType
  isMain?: boolean
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, isMain = false }) => {
  const { t } = useTranslation('skills')
  const color = SKILL_COLORS[skill]

  return (
    <View style={[styles.badge, { backgroundColor: color }, isMain && styles.mainBadge]}>
      <Text style={[styles.label, isMain && styles.mainLabel]}>{t(skill)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  mainBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  // TODO: Style pour les futures icônes de badges
  // icon: {
  //   width: 16,
  //   height: 16,
  //   marginRight: 6,
  // },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  mainLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
})
