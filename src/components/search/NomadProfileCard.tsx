import React, { memo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme'
import { UserProfile } from '../../types/user'
import { SkillBadge } from '../SkillBadge'

interface NomadProfileCardProps {
  profile: UserProfile
  distance?: number
  onAddFriend: () => void
  onPress: () => void
  isPending?: boolean
  isAlreadyFriend?: boolean
  isReceived?: boolean
  connectionId?: string
}

const formatDistance = (meters: number, t: any): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export const NomadProfileCard = memo(function NomadProfileCard({
  profile,
  distance,
  onAddFriend,
  onPress,
  isPending = false,
  isAlreadyFriend = false,
  isReceived = false,
  connectionId,
}: NomadProfileCardProps) {
  const { t } = useTranslation('search')

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* Header: Avatar + Name + 3-dots */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={colors.white} />
            </View>
          )}
          {/* Status dot overlapping avatar */}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: profile.is_visible ? colors.success : colors.text.tertiary },
            ]}
          />
        </View>

        <View style={styles.nameSection}>
          <Text style={styles.username} numberOfLines={1}>
            {profile.username}
          </Text>
          {distance !== undefined && distance > 0 && (
            <Text style={styles.distance}>{formatDistance(distance, t)}</Text>
          )}
        </View>

        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Bio */}
      <Text style={styles.bio} numberOfLines={2}>
        {profile.bio || t('card.defaultBio', { defaultValue: 'Nomadic traveler exploring the world' })}
      </Text>

      {/* Skill badges */}
      {profile.skills.length > 0 && (
        <View style={styles.tagsContainer}>
          {profile.skills.slice(0, 3).map(skill => (
            <SkillBadge key={skill} skill={skill} />
          ))}
          {profile.skills.length > 3 && (
            <View style={styles.moreSkillsBadge}>
              <Text style={styles.moreSkillsText}>+{profile.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      {/* Footer: Say Hello button + Add friend icon button */}
      <View style={styles.footer}>
        {isReceived ? (
          <TouchableOpacity style={styles.receivedButton} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="mail" size={16} color={colors.secondary.main} />
            <Text style={styles.receivedButtonText}>
              {t('card.received', { defaultValue: 'Request received' })}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.sayHelloButton} onPress={onPress} activeOpacity={0.85}>
              <Text style={styles.sayHelloText}>{t('card.sayHello')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addIconButton,
                (isPending || isAlreadyFriend) && styles.addIconButtonDisabled,
              ]}
              onPress={onAddFriend}
              disabled={isPending || isAlreadyFriend}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isAlreadyFriend ? 'checkmark' : isPending ? 'time' : 'person-add'}
                size={18}
                color={isAlreadyFriend ? colors.success : colors.text.secondary}
              />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    backgroundColor: colors.secondary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
  },
  nameSection: {
    flex: 1,
  },
  username: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  distance: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },
  menuButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  moreSkillsBadge: {
    backgroundColor: colors.border.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  moreSkillsText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sayHelloButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  sayHelloText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  addIconButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  addIconButtonDisabled: {
    opacity: 0.5,
  },
  receivedButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.secondary.main,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
  },
  receivedButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.secondary.main,
  },
})
