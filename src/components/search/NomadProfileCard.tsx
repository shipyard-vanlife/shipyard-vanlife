import React, { memo, useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View, Modal, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme'
import type { SkillType } from '../../types/user'
import { SkillBadge } from '../SkillBadge'
import { useBlockUser } from '../../hooks/useModeration'

interface ProfileCardData {
  id: string
  username: string
  avatar_url: string | null
  bio?: string | null
  skills: SkillType[]
  van_photo_url?: string | null
}

interface NomadProfileCardProps {
  profile: ProfileCardData
  distance?: number // en mètres
  onAddFriend: () => void
  onPress: () => void
  isPending?: boolean
  isAlreadyFriend?: boolean
  isReceived?: boolean
  connectionId?: string
}

const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  const km = meters / 1000
  return `${Math.round(km)}km`
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
  const { t } = useTranslation(['search', 'common'])
  const [showMenu, setShowMenu] = useState(false)
  const { mutate: blockUser } = useBlockUser()

  const handleBlock = () => {
    setShowMenu(false)
    Alert.alert(
      t('common:moderation.blockConfirmTitle', { username: profile.username }),
      t('common:moderation.blockConfirmMessage'),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:moderation.blockUser'),
          style: 'destructive',
          onPress: () => {
            blockUser(profile.id, {
              onSuccess: () => {
                Alert.alert(
                  t('common:moderation.blockSuccess'),
                  t('common:moderation.blockSuccessMessage', { username: profile.username })
                )
              },
              onError: () => {
                Alert.alert(t('common:errors.generic'), t('common:moderation.blockError'))
              },
            })
          },
        },
      ]
    )
  }

  const handleReport = () => {
    setShowMenu(false)
    Alert.alert(
      t('common:moderation.reportProfile'),
      t('common:moderation.reportMessage', { username: profile.username })
    )
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.95}>
      {/* Header: Avatar + Name + Distance + 3-dots */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={28} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.nameSection}>
          <Text style={styles.username} numberOfLines={1}>
            {profile.username}
          </Text>
        </View>

        <View style={styles.rightSection}>
          {distance !== undefined && distance > 0 && (
            <Text style={styles.distanceRight}>{formatDistance(distance)}</Text>
          )}
          <TouchableOpacity style={styles.menuButton} activeOpacity={0.7} onPress={() => setShowMenu(true)}>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Modal */}
      <Modal visible={showMenu} transparent animationType="fade">
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
              <Ionicons name="flag-outline" size={20} color={colors.text.tertiary} />
              <Text style={styles.menuText}>{t('common:moderation.reportProfile')}</Text>
            </TouchableOpacity>
            <View style={styles.menuSeparator} />
            <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
              <Ionicons name="ban-outline" size={20} color={colors.error} />
              <Text style={[styles.menuText, styles.menuTextDanger]}>
                {t('common:moderation.blockUser')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Bio */}
      {profile.bio && (
        <Text style={styles.bio} numberOfLines={2}>
          {profile.bio}
        </Text>
      )}

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

      {/* Footer: Add friend button + Van photo */}
      <View style={styles.footer}>
        {/* Action button */}
        {isReceived ? (
          <TouchableOpacity style={styles.receivedButton} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="mail" size={16} color={colors.secondary.main} />
            <Text style={styles.receivedButtonText}>
              {t('card.received', { defaultValue: 'Request received' })}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.addFriendButton,
              (isPending || isAlreadyFriend) && styles.addFriendButtonDisabled,
            ]}
            onPress={onAddFriend}
            disabled={isPending || isAlreadyFriend}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isAlreadyFriend ? 'checkmark' : isPending ? 'time' : 'person-add'}
              size={18}
              color={colors.white}
            />
            <Text style={styles.addFriendText}>
              {isAlreadyFriend ? t('card.friend') : isPending ? t('card.pending') : t('card.addFriend')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Van photo */}
        <View style={styles.vanPhotoContainer}>
          {profile.van_photo_url ? (
            <Image
              source={{ uri: profile.van_photo_url }}
              style={styles.vanPhoto}
              resizeMode="cover"
              defaultSource={require('../../../assets/van-life.jpg')}
            />
          ) : (
            <Image
              source={require('../../../assets/van-life.jpg')}
              style={styles.vanPhoto}
              resizeMode="cover"
            />
          )}
        </View>
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
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  distanceRight: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text.tertiary,
    backgroundColor: colors.border.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
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
    gap: spacing.md,
  },
  vanPhotoContainer: {
    flex: 1,
    height: 110,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.border.light,
  },
  vanPhoto: {
    width: '100%',
    height: '100%',
  },
  addFriendButton: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  addFriendButtonDisabled: {
    opacity: 0.6,
    backgroundColor: colors.text.tertiary,
  },
  addFriendText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    minWidth: 200,
    ...shadows.large,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  menuText: {
    fontSize: fontSize.base,
    color: colors.text.primary,
    fontWeight: fontWeight.medium,
  },
  menuTextDanger: {
    color: colors.error,
  },
  menuSeparator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.md,
  },
  receivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.secondary.main,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.xs,
    ...shadows.small,
  },
  receivedButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.secondary.main,
  },
})
