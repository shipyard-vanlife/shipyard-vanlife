import React, { memo } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme'
import type { SkillType } from '../../types/user'
import { SkillBadge } from '../SkillBadge'

interface ProfileCardData {
  id: string
  username: string
  avatar_url: string | null
  bio?: string | null
  skills: SkillType[]
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

const formatDistance = (meters: number, t: any): string => {
  if (meters < 1000) {
    return `${Math.round(meters)}${t('distance.meters')}`
  }
  return `${(meters / 1000).toFixed(1)}${t('distance.kilometers')}`
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
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Section supérieure */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {profile.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatar} resizeMode="cover" />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={24} color={colors.text.tertiary} />
            </View>
          )}
        </View>

        {/* Infos utilisateur */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {profile.username}
            </Text>
            {distance !== undefined && (
              <View style={styles.distanceBadge}>
                <Text style={styles.distanceText}>{formatDistance(distance, t)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.bio} numberOfLines={1}>
            {profile.bio || t('card.defaultBio', { defaultValue: 'Voyageur nomade' })}
          </Text>
        </View>
      </View>

      {/* Badges de compétences */}
      {profile.skills.length > 0 && (
        <View style={styles.tagsContainer}>
          {profile.skills.slice(0, 3).map(skill => (
            <SkillBadge key={skill} skill={skill} />
          ))}
        </View>
      )}

      {/* Section inférieure */}
      <View style={styles.footer}>
        {isReceived ? (
          // Demande reçue → Afficher texte "Demande reçue" et renvoyer vers le profil
          <TouchableOpacity style={styles.receivedButton} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name="mail" size={14} color={colors.secondary.main} />
            <Text style={styles.receivedButtonText}>
              {t('card.received', { defaultValue: 'Demande reçue' })}
            </Text>
          </TouchableOpacity>
        ) : (
          // Cas normal : Ajouter / En attente / Ami
          <TouchableOpacity
            style={[
              styles.addButton,
              isPending && styles.addButtonPending,
              isAlreadyFriend && styles.addButtonFriend,
            ]}
            onPress={onAddFriend}
            disabled={isPending || isAlreadyFriend}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isAlreadyFriend ? 'checkmark' : 'person-add'}
              size={14}
              color={colors.white}
            />
            <Text style={styles.addButtonText}>
              {isAlreadyFriend
                ? t('card.friend')
                : isPending
                  ? t('card.pending')
                  : t('card.addFriend')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.medium,
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
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.white,
    ...shadows.small,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  username: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  distanceBadge: {
    backgroundColor: colors.primary.dark,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  distanceText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text.secondary,
  },
  bio: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.regular,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
    ...shadows.small,
  },
  addButtonPending: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.6,
  },
  addButtonFriend: {
    backgroundColor: '#4A90E2',
    opacity: 1,
  },
  addButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  receivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.secondary.main,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 4,
  },
  receivedButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.secondary.main,
  },
})
