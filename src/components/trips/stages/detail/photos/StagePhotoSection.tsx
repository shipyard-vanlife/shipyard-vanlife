import React, { useState } from 'react'
import { View, Text, StyleSheet, Alert, ActionSheetIOS, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../../../../../styles/theme'
import { useStagePhotos, useAddStagePhoto, useDeleteStagePhoto, useStagePhotoPicker } from '../../../../../hooks/useStagePhotos'
import { useAuth } from '../../../../../contexts/AuthContext'
import { StagePhotoGrid } from './StagePhotoGrid'
import { StagePhotoViewer } from './StagePhotoViewer'
import type { StagePhoto } from '../../../../../types/trip'

const MAX_PHOTOS = 4

interface StagePhotoSectionProps {
  stageId: string
}

export function StagePhotoSection({ stageId }: StagePhotoSectionProps) {
  const { t } = useTranslation('trips')
  const { user } = useAuth()
  const { data: photos = [], isLoading } = useStagePhotos(stageId)
  const { mutate: addPhoto, isPending: isAddingToDb } = useAddStagePhoto()
  const { mutate: deletePhoto, isPending: isDeleting } = useDeleteStagePhoto()
  const { pickAndUploadPhoto, takeAndUploadPhoto, isLoading: isUploading } = useStagePhotoPicker()

  const [viewerVisible, setViewerVisible] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const isAddingPhoto = isUploading || isAddingToDb

  const handlePhotoPress = (_photo: StagePhoto, index: number) => {
    setSelectedIndex(index)
    setViewerVisible(true)
  }

  const handlePhotoLongPress = (photo: StagePhoto) => {
    Alert.alert(t('photos.deletePhoto'), '', [
      { text: t('confirmations.cancel'), style: 'cancel' },
      {
        text: t('confirmations.deleteTripConfirm'),
        style: 'destructive',
        onPress: () => {
          deletePhoto({
            photoId: photo.id,
            stageId,
            photoUrl: photo.photo_url,
          })
        },
      },
    ])
  }

  const handleDeleteFromViewer = (photo: StagePhoto) => {
    deletePhoto(
      {
        photoId: photo.id,
        stageId,
        photoUrl: photo.photo_url,
      },
      {
        onSuccess: () => {
          // Close viewer if no more photos
          if (photos.length <= 1) {
            setViewerVisible(false)
          } else if (selectedIndex >= photos.length - 1) {
            setSelectedIndex(Math.max(0, selectedIndex - 1))
          }
        },
      }
    )
  }

  const handleAddPhoto = async (source: 'gallery' | 'camera') => {
    if (!user?.id) return
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(t('photos.maxReached'))
      return
    }

    const uploadFn = source === 'gallery' ? pickAndUploadPhoto : takeAndUploadPhoto
    const photoUrl = await uploadFn(user.id, stageId)

    if (photoUrl) {
      addPhoto({ stageId, photoUrl })
    }
  }

  const showAddPhotoOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('confirmations.cancel'), t('photos.fromGallery'), t('photos.takePhoto')],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) handleAddPhoto('gallery')
          if (buttonIndex === 2) handleAddPhoto('camera')
        }
      )
    } else {
      Alert.alert(t('photos.addPhoto'), '', [
        { text: t('confirmations.cancel'), style: 'cancel' },
        { text: t('photos.fromGallery'), onPress: () => handleAddPhoto('gallery') },
        { text: t('photos.takePhoto'), onPress: () => handleAddPhoto('camera') },
      ])
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="images-outline" size={18} color={colors.text.tertiary} />
          <Text style={styles.title}>{t('photos.title')}</Text>
        </View>
        {photos.length >= MAX_PHOTOS ? (
          <Text style={styles.maxHint}>{t('photos.maxReached')}</Text>
        ) : null}
      </View>

      <StagePhotoGrid
        photos={photos}
        onPhotoPress={handlePhotoPress}
        onPhotoLongPress={handlePhotoLongPress}
        onAddPhoto={showAddPhotoOptions}
        isAddingPhoto={isAddingPhoto}
      />

      <StagePhotoViewer
        visible={viewerVisible}
        photos={photos}
        initialIndex={selectedIndex}
        onClose={() => setViewerVisible(false)}
        onDelete={handleDeleteFromViewer}
        isDeleting={isDeleting}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.tertiary,
  },
  maxHint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
})
