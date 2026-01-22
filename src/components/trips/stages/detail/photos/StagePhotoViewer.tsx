import React, { useState, useCallback } from 'react'
import { Modal, Alert, StyleSheet, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useDragToClose } from '../../../../../hooks/useDragToClose'
// TODO: Uncomment when using development build (not Expo Go)
// import { useViewerOrientation } from '../../../../../hooks/useViewerOrientation'
import { ViewerHeader } from './ViewerHeader'
import { PhotoGallery } from './PhotoGallery'
import { DotsIndicator } from './DotsIndicator'
import type { StagePhoto } from '../../../../../types/trip'

interface StagePhotoViewerProps {
  visible: boolean
  photos: StagePhoto[]
  initialIndex: number
  onClose: () => void
  onDelete?: (photo: StagePhoto) => void
  isDeleting?: boolean
}

export function StagePhotoViewer({
  visible,
  photos,
  initialIndex,
  onClose,
  onDelete,
  isDeleting = false,
}: StagePhotoViewerProps) {
  const { t } = useTranslation('trips')
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const insets = useSafeAreaInsets()

  // Custom hooks for drag-to-close and orientation
  const { translateY, backgroundOpacity, panHandlers } = useDragToClose({
    enabled: visible,
    onClose,
  })

  // TODO: Uncomment when using development build (not Expo Go)
  // useViewerOrientation(visible)

  const handleDelete = useCallback(() => {
    if (!onDelete) return

    const photo = photos[currentIndex]
    Alert.alert(t('photos.confirmDeletePhoto'), '', [
      { text: t('confirmations.cancel'), style: 'cancel' },
      {
        text: t('confirmations.deleteTripConfirm'),
        style: 'destructive',
        onPress: () => onDelete(photo),
      },
    ])
  }, [onDelete, photos, currentIndex, t])

  const handleIndexChange = useCallback((index: number) => {
    setCurrentIndex(index)
  }, [])

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <Animated.View style={[styles.container, { opacity: backgroundOpacity }]}>
        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY }],
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right,
            },
          ]}
          {...panHandlers}
        >
          <ViewerHeader
            currentIndex={currentIndex}
            totalCount={photos.length}
            onClose={onClose}
            onDelete={onDelete ? handleDelete : undefined}
            isDeleting={isDeleting}
          />

          <PhotoGallery
            photos={photos}
            initialIndex={initialIndex}
            onIndexChange={handleIndexChange}
          />

          <DotsIndicator count={photos.length} activeIndex={currentIndex} />
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  content: {
    flex: 1,
  },
})
