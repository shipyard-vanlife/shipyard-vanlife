import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ALL_SKILLS, SKILL_COLORS, SkillType } from '../../../types/user'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'

interface ProfileEditSkillSelectorProps {
  label: string
  hint?: string
  selectedSkill: SkillType | null
  onSelectSkill: (skill: SkillType | null) => void
  disabled?: boolean
}

export const ProfileEditSkillSelector: React.FC<ProfileEditSkillSelectorProps> = ({
  label,
  hint,
  selectedSkill,
  onSelectSkill,
  disabled = false,
}) => {
  const { t } = useTranslation('skills')

  const handlePress = (skill: SkillType) => {
    if (disabled) return
    // Toggle: if already selected, deselect
    onSelectSkill(selectedSkill === skill ? null : skill)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.skillsGrid}>
        {ALL_SKILLS.map(skill => {
          const isSelected = selectedSkill === skill
          return (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillButton,
                { backgroundColor: isSelected ? SKILL_COLORS[skill] : colors.primary.dark },
                disabled && styles.skillButtonDisabled,
              ]}
              onPress={() => handlePress(skill)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.skillButtonText,
                  { color: isSelected ? colors.white : colors.text.secondary },
                ]}
              >
                {t(skill)}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.text.muted,
    marginBottom: spacing.md,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  skillButtonDisabled: {
    opacity: 0.6,
  },
  skillButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
})
