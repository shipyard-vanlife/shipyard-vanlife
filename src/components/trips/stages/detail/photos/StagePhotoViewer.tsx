import React, { useState } from 'react'
import {
  Modal,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing } from '../../../../../styles/theme'
import type { StagePhoto } from '../../../../../types/trip'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

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

  const handleDelete = () => {
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
  }

  const onViewableItemsChanged = React.useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index)
      }
    },
    []
  )

  const viewabilityConfig = React.useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  )

  const renderPhoto = ({ item }: { item: StagePhoto }) => (
    <View style={styles.photoContainer}>
      <Image source={{ uri: item.photo_url }} style={styles.photo} resizeMode="contain" />
    </View>
  )

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.white} />
            </TouchableOpacity>

            <Text style={styles.counter}>
              {currentIndex + 1} / {photos.length}
            </Text>

            {onDelete ? (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="trash-outline" size={24} color={colors.white} />
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Photo Gallery */}
          <FlatList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: SCREEN_WIDTH,
              offset: SCREEN_WIDTH * index,
              index,
            })}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          {/* Dots Indicator */}
          {photos.length > 1 ? (
            <View style={styles.dotsContainer}>
              {photos.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, index === currentIndex && styles.dotActive]}
                />
              ))}
            </View>
          ) : null}
        </SafeAreaView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
})
