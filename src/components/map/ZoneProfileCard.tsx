import React, { memo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme'
import { SkillBadge } from '../SkillBadge'
import type { NearbyProfile } from '../../types/location'

interface ZoneProfileCardProps {
  profile: NearbyProfile
  onPress: () => void
}

export const ZoneProfileCard = memo<ZoneProfileCardProps>(function ZoneProfileCard({
  profile,
  onPress,
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      {/* Avatar */}
      <View style={styles.avatarWrapper}>
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={22} color={colors.text.tertiary} />
          </View>
        )}
      </View>

      {/* Info column */}
      <View style={styles.infoColumn}>
        <View style={styles.nameRow}>
          <Text style={styles.username} numberOfLines={1}>
            {profile.username}
          </Text>
          {profile.van_name ? (
            <View style={styles.vanBadge}>
              <Text style={styles.vanBadgeText} numberOfLines={1}>
                {profile.van_name}
              </Text>
            </View>
          ) : null}
        </View>

        {profile.city ? (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={colors.text.muted} />
            <Text style={styles.city} numberOfLines={1}>
              {profile.city}
            </Text>
          </View>
        ) : null}

        {profile.skills.length > 0 ? (
          <View style={styles.skillsRow}>
            {profile.skills.slice(0, 3).map(skill => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </View>
        ) : null}
      </View>

      {/* Arrow */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={18} color={colors.border.dark} />
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  avatarWrapper: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 2.5,
    borderColor: colors.white,
    ...shadows.medium,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoColumn: {
    flex: 1,
    marginRight: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 2,
  },
  username: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flexShrink: 1,
  },
  vanBadge: {
    backgroundColor: colors.tertiary.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    maxWidth: 100,
  },
  vanBadgeText: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.medium,
    color: colors.tertiary.dark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.xs,
  },
  city: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
