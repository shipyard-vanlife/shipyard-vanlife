import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ALL_SKILLS, SKILL_COLORS, SkillType } from '../../../types/user'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../../styles/theme'

interface ProfileEditSkillSelectorProps {
  label: string
  hint?: string
  selectedSkills: SkillType[]
  onSelectSkills: (skills: SkillType[]) => void
  maxSkills?: number
  disabled?: boolean
}

export const ProfileEditSkillSelector: React.FC<ProfileEditSkillSelectorProps> = ({
  label,
  hint,
  selectedSkills,
  onSelectSkills,
  maxSkills = 3,
  disabled = false,
}) => {
  const { t } = useTranslation('skills')

  const handlePress = (skill: SkillType) => {
    if (disabled) return

    const isSelected = selectedSkills.includes(skill)

    if (isSelected) {
      // Désélectionner
      onSelectSkills(selectedSkills.filter(s => s !== skill))
    } else {
      // Sélectionner si on n'a pas atteint le max
      if (selectedSkills.length < maxSkills) {
        onSelectSkills([...selectedSkills, skill])
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.counter}>
          {selectedSkills.length}/{maxSkills}
        </Text>
      </View>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={styles.skillsGrid}>
        {ALL_SKILLS.map(skill => {
          const isSelected = selectedSkills.includes(skill)
          const canSelect = selectedSkills.length < maxSkills || isSelected

          return (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillButton,
                {
                  backgroundColor: isSelected ? SKILL_COLORS[skill] : colors.primary.dark,
                  borderWidth: isSelected ? 0 : 1,
                  borderColor: colors.border.light,
                },
                (!canSelect || disabled) && styles.skillButtonDisabled,
              ]}
              onPress={() => handlePress(skill)}
              disabled={disabled || !canSelect}
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
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary.main,
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
    opacity: 0.4,
  },
  skillButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
})
