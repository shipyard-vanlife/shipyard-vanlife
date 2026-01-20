import React from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

interface ProfileHeaderProps {
  avatarUrl: string | null
  firstname: string | null
  lastname: string | null
  username: string
  vanName: string | null
  daysOnRoad: number
  // Avatar editing props (optional)
  onAvatarPress?: () => void
  isUploadingAvatar?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  firstname,
  lastname,
  username,
  vanName,
  daysOnRoad,
  onAvatarPress,
  isUploadingAvatar = false,
}) => {
  const { t } = useTranslation('profile')

  const displayName =
    firstname || lastname ? `${firstname ?? ''} ${lastname ?? ''}`.trim() : username

  const formatDuration = (days: number): string => {
    if (days >= 365) {
      const years = Math.floor(days / 365)
      return t('tagline.year', { count: years })
    }
    if (days >= 30) {
      const months = Math.floor(days / 30)
      return t('tagline.month', { count: months })
    }
    return t('tagline.day', { count: days })
  }

  const avatarContent = isUploadingAvatar ? (
    <View style={styles.avatarPlaceholder}>
      <ActivityIndicator size="large" color={colors.secondary.main} />
    </View>
  ) : avatarUrl ? (
    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
  ) : (
    <View style={styles.avatarPlaceholder}>
      <Ionicons name="person" size={48} color={colors.text.tertiary} />
    </View>
  )

  return (
    <View style={styles.container}>
      {onAvatarPress ? (
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarPress}
          disabled={isUploadingAvatar}
          activeOpacity={0.7}
        >
          {avatarContent}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.avatarContainer}>{avatarContent}</View>
      )}

      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.username}>@{username}</Text>

      {vanName ? (
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>{vanName}</Text>
          <Ionicons
            name="car-outline"
            size={16}
            color={colors.text.tertiary}
            style={styles.vanIcon}
          />
        </View>
      ) : null}

      <Text style={styles.duration}>
        {t('tagline.onRoadFor')} {formatDuration(daysOnRoad)}
      </Text>
    </View>
  )
}

const AVATAR_SIZE = 100

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  avatarContainer: {
    marginBottom: spacing.lg,
    position: 'relative',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.tertiary.main,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary.dark,
    borderWidth: 3,
    borderColor: colors.tertiary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  username: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  vanIcon: {
    marginLeft: spacing.xs,
  },
  duration: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
})
