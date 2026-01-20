import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SkillBadge } from '../SkillBadge'
import { SkillType } from '../../types/user'
import { spacing } from '../../styles/theme'

interface ProfileSkillBadgesProps {
  skills: SkillType[]
  mainSpecialty: SkillType | null
}

export const ProfileSkillBadges: React.FC<ProfileSkillBadgesProps> = ({
  skills,
  mainSpecialty,
}) => {
  if (skills.length === 0 && !mainSpecialty) {
    return null
  }

  // Put main specialty first, then other skills (excluding main from list)
  const orderedSkills: SkillType[] = []

  if (mainSpecialty) {
    orderedSkills.push(mainSpecialty)
  }

  skills.forEach(skill => {
    if (skill !== mainSpecialty) {
      orderedSkills.push(skill)
    }
  })

  return (
    <View style={styles.container}>
      {orderedSkills.map((skill, index) => (
        <SkillBadge key={skill} skill={skill} isMain={index === 0 && mainSpecialty !== null} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
})
