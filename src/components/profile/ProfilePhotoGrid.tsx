import React from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

const MAX_PHOTOS = 5

interface ProfilePhotoGridProps {
  photos: string[]
  isOwnProfile?: boolean
  onAddPhoto?: () => void
  onDeletePhoto?: (photoUrl: string) => void
  isUploading?: boolean
  isDeleting?: boolean
}

const NUM_COLUMNS = 2
const SCREEN_WIDTH = Dimensions.get('window').width
const GAP = spacing.md
const HORIZONTAL_PADDING = spacing.xl
const PHOTO_SIZE =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS

export const ProfilePhotoGrid: React.FC<ProfilePhotoGridProps> = ({
  photos,
  isOwnProfile = false,
  onAddPhoto,
  onDeletePhoto,
  isUploading = false,
  isDeleting = false,
}) => {
  const { t } = useTranslation('profile')

  const canAddMore = photos.length < MAX_PHOTOS

  const renderPhoto = ({ item, index }: { item: string; index: number }) => (
    <View
      style={[
        styles.photoContainer,
        index % NUM_COLUMNS === 0 ? styles.photoLeft : styles.photoRight,
      ]}
    >
      <Image source={{ uri: item }} style={styles.photo} />
      {isOwnProfile && onDeletePhoto ? (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeletePhoto(item)}
          activeOpacity={0.7}
          disabled={isDeleting}
        >
          <Ionicons name="close" size={16} color={colors.white} />
        </TouchableOpacity>
      ) : null}
    </View>
  )

  const renderAddButton = () => {
    if (!isOwnProfile || !onAddPhoto || !canAddMore) return null

    return (
      <TouchableOpacity
        style={[styles.photoContainer, styles.addButton]}
        onPress={onAddPhoto}
        activeOpacity={0.7}
        disabled={isUploading}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color={colors.secondary.main} />
        ) : (
          <Ionicons name="add" size={32} color={colors.text.tertiary} />
        )}
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('sections.photos')}</Text>

      {photos.length > 0 ? (
        <View style={styles.gridContainer}>
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item, index) => `photo-${index}`}
            numColumns={NUM_COLUMNS}
            scrollEnabled={false}
            columnWrapperStyle={styles.row}
            ListFooterComponent={renderAddButton}
          />
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="images-outline" size={32} color={colors.text.muted} />
          <Text style={styles.placeholderText}>{t('placeholders.noPhotos')}</Text>
          {isOwnProfile && onAddPhoto ? (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={onAddPhoto}
              activeOpacity={0.7}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="add" size={16} color={colors.white} />
                  <Text style={styles.addPhotoButtonText}>{t('photos.add')}</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  gridContainer: {
    paddingHorizontal: spacing.xl,
  },
  row: {
    marginBottom: GAP,
  },
  photoContainer: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  photoLeft: {
    marginRight: GAP / 2,
  },
  photoRight: {
    marginLeft: GAP / 2,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.dark,
  },
  deleteButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary.light,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
  },
  placeholderText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.text.muted,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  addPhotoButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
