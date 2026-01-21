import React from 'react'
import { View, StyleSheet } from 'react-native'
import { spacing } from '../../../../../styles/theme'
import { StagePhotoThumbnail, AddPhotoButton } from './StagePhotoThumbnail'
import type { StagePhoto } from '../../../../../types/trip'

const MAX_PHOTOS = 4

interface StagePhotoGridProps {
  photos: StagePhoto[]
  onPhotoPress: (photo: StagePhoto, index: number) => void
  onPhotoLongPress?: (photo: StagePhoto) => void
  onAddPhoto: () => void
  isAddingPhoto?: boolean
}

export function StagePhotoGrid({
  photos,
  onPhotoPress,
  onPhotoLongPress,
  onAddPhoto,
  isAddingPhoto = false,
}: StagePhotoGridProps) {
  const canAddMore = photos.length < MAX_PHOTOS

  return (
    <View style={styles.grid}>
      {photos.map((photo, index) => (
        <StagePhotoThumbnail
          key={photo.id}
          photoUrl={photo.photo_url}
          onPress={() => onPhotoPress(photo, index)}
          onLongPress={onPhotoLongPress ? () => onPhotoLongPress(photo) : undefined}
        />
      ))}
      {canAddMore ? <AddPhotoButton onPress={onAddPhoto} isLoading={isAddingPhoto} /> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
