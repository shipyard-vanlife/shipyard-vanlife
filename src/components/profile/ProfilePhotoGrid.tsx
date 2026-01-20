import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

const MAX_PHOTOS = 5
const PHOTO_SIZE = 110

interface ProfilePhotoGridProps {
  photos: string[]
  isOwnProfile?: boolean
  onAddPhoto?: () => void
  onDeletePhoto?: (photoUrl: string) => void
  onPhotoPress?: (photoUrl: string) => void
  isUploading?: boolean
  isDeleting?: boolean
}

export const ProfilePhotoGrid: React.FC<ProfilePhotoGridProps> = ({
  photos,
  isOwnProfile = false,
  onAddPhoto,
  onDeletePhoto,
  onPhotoPress,
  isUploading = false,
  isDeleting = false,
}) => {
  const { t } = useTranslation('profile')

  const canAddMore = photos.length < MAX_PHOTOS

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.photos')}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {photos.map((photoUrl, index) => (
          <TouchableOpacity
            key={`photo-${index}`}
            style={styles.photoWrapper}
            onPress={() => onPhotoPress?.(photoUrl)}
            activeOpacity={0.9}
            disabled={!onPhotoPress}
          >
            <Image source={{ uri: photoUrl }} style={styles.photo} />
            {isOwnProfile && onDeletePhoto ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDeletePhoto(photoUrl)}
                activeOpacity={0.7}
                disabled={isDeleting}
              >
                <Ionicons name="close" size={14} color={colors.white} />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
        ))}

        {/* Add button */}
        {isOwnProfile && onAddPhoto && canAddMore ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPhoto}
            activeOpacity={0.7}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color={colors.secondary.main} />
            ) : (
              <>
                <Ionicons name="add" size={24} color={colors.text.tertiary} />
                <Text style={styles.addText}>{t('actions.addPhoto')}</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}

        {/* Empty state */}
        {photos.length === 0 && !isOwnProfile ? (
          <View style={styles.emptyState}>
            <Ionicons name="images-outline" size={24} color={colors.text.muted} />
            <Text style={styles.emptyText}>{t('placeholders.noPhotos')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.dark,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.light,
    borderWidth: 1.5,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addText: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  emptyState: {
    width: PHOTO_SIZE * 2,
    height: PHOTO_SIZE,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
})
