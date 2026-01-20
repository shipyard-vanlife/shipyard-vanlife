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

  // Build subtitle: 📍 City · Van Name
  const subtitleParts: string[] = []
  if (city) subtitleParts.push(city)
  if (vanName) subtitleParts.push(vanName)
  const subtitle = subtitleParts.join(' · ')

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
      {/* Top bar for other profile (back + favorite) */}
      {!isOwnProfile ? (
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.topBarButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
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
        </View>
      ) : null}

      {/* Avatar */}
      {isOwnProfile && onAvatarPress ? (
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

      {/* Name */}
      <Text style={styles.name}>{displayName}</Text>

      {/* Subtitle: location + van */}
      {subtitle ? (
        <View style={styles.subtitleContainer}>
          <Ionicons
            name="location-outline"
            size={14}
            color={colors.text.tertiary}
            style={styles.locationIcon}
          />
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      ) : null}

      {/* Edit button for own profile */}
      {isOwnProfile && onEditPress ? (
        <TouchableOpacity
          style={styles.editButton}
          onPress={onEditPress}
          activeOpacity={0.7}
        >
          <Text style={styles.editButtonText}>{t('header.edit')}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const AVATAR_SIZE = 100

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  topBarButton: {
    padding: spacing.sm,
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
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationIcon: {
    marginRight: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
  },
  editButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
