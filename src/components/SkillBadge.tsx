import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { SkillBadge as SkillBadgeType, SKILL_BADGES } from '../types/user';

interface SkillBadgeProps {
  skill: SkillBadgeType;
  isMain?: boolean;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, isMain = false }) => {
  const badgeInfo = SKILL_BADGES[skill];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeInfo.color },
        isMain && styles.mainBadge,
      ]}
    >
      {/* TODO: Remplacer par une vraie image de badge
          Exemple: <Image source={badgeInfo.icon} style={styles.icon} />
          Pour l'instant, affichage du texte uniquement */}
      <Text style={[styles.label, isMain && styles.mainLabel]}>
        {badgeInfo.label}
      </Text>
    </View>
  );
};

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
});
