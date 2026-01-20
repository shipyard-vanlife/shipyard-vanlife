import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

interface ProfileHeaderProps {
  avatarUrl: string | null
  firstname: string | null
  lastname: string | null
  username: string
  vanName: string | null
  city: string | null
  daysOnRoad: number
  isOwnProfile: boolean
  // Own profile actions
  onAvatarPress?: () => void
  onEditPress?: () => void
  isUploadingAvatar?: boolean
  // Other profile actions
  onBackPress?: () => void
  onFavoritePress?: () => void
  isFavorite?: boolean
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  avatarUrl,
  firstname,
  lastname,
  username,
  vanName,
  city,
  daysOnRoad,
  isOwnProfile,
  onAvatarPress,
  onEditPress,
  isUploadingAvatar = false,
  onBackPress,
  onFavoritePress,
  isFavorite = false,
}) => {
  const { t } = useTranslation('profile')

  const displayName =
    firstname || lastname ? `${firstname ?? ''} ${lastname ?? ''}`.trim() : username

  // Build subtitle: City · Van Name
  const subtitleParts: string[] = []
  if (city) subtitleParts.push(city)
  if (vanName) subtitleParts.push(vanName)
  const subtitle = subtitleParts.join(' · ')

  // Format days on road tagline
  const getTagline = () => {
    if (daysOnRoad === 0) return null

    let timeText = ''
    if (daysOnRoad >= 365) {
      const years = Math.floor(daysOnRoad / 365)
      timeText = t('tagline.year', { count: years })
    } else if (daysOnRoad >= 30) {
      const months = Math.floor(daysOnRoad / 30)
      timeText = t('tagline.month', { count: months })
    } else {
      timeText = t('tagline.day', { count: daysOnRoad })
    }

    return `${t('tagline.onRoadFor')} ${timeText}`
  }

  const tagline = getTagline()

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
      {/* Top bar */}
      <View style={styles.topBar}>
        {!isOwnProfile ? (
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.topBarSpacer} />
        )}

        <View style={styles.topBarRight}>
          {!isOwnProfile && onFavoritePress ? (
            <TouchableOpacity
              style={styles.topBarButton}
              onPress={onFavoritePress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? colors.error : colors.text.primary}
              />
            </TouchableOpacity>
          ) : null}
          {isOwnProfile && onEditPress ? (
            <TouchableOpacity
              style={styles.editChip}
              onPress={onEditPress}
              activeOpacity={0.7}
            >
              <Text style={styles.editChipText}>{t('header.edit')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Avatar */}
      {isOwnProfile && onAvatarPress ? (
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={onAvatarPress}
          disabled={isUploadingAvatar}
          activeOpacity={0.7}
        >
          {avatarContent}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={14} color={colors.white} />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.avatarContainer}>{avatarContent}</View>
      )}

      {/* Name */}
      <Text style={styles.name}>{displayName}</Text>

      {/* Username */}
      <Text style={styles.username}>@{username}</Text>

      {/* Subtitle: location + van */}
      {subtitle ? (
        <View style={styles.subtitleContainer}>
          <Ionicons
            name="location"
            size={14}
            color={colors.tertiary.main}
            style={styles.locationIcon}
          />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      ) : null}

      {/* Tagline */}
      {tagline ? (
        <View style={styles.taglineContainer}>
          <Text style={styles.tagline}>{tagline}</Text>
          <Text style={styles.taglineIcon}> 🚐</Text>
        </View>
      ) : null}
    </View>
  )
}

const AVATAR_SIZE = 100

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    marginBottom: spacing.md,
  },
  topBarButton: {
    padding: spacing.sm,
  },
  topBarSpacer: {
    width: 40,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  editChip: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  editChipText: {
    color: colors.text.primary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  avatarContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondary.main,
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.primary.main,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.tertiary.light,
  },
  avatarPlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: colors.primary.dark,
    borderWidth: 3,
    borderColor: colors.tertiary.light,
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
    marginBottom: spacing.sm,
  },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  taglineIcon: {
    fontSize: fontSize.sm,
  },
})
