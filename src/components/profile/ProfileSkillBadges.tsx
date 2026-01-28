import React from 'react'
import { View, StyleSheet } from 'react-native'
import { SkillBadge } from '../SkillBadge'
import { SkillType } from '../../types/user'
import { spacing } from '../../styles/theme'

interface ProfileSkillBadgesProps {
  skills: SkillType[]
}

export const ProfileSkillBadges: React.FC<ProfileSkillBadgesProps> = ({ skills }) => {
  if (skills.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {skills.map(skill => (
        <SkillBadge key={skill} skill={skill} />
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
