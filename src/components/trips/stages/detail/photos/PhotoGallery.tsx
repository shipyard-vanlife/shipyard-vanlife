import React, { useCallback, useMemo } from 'react'
import { View, Image, FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import type { StagePhoto } from '../../../../../types/trip'

// Hoisted outside component to prevent re-creation
const viewabilityConfig = {
  itemVisiblePercentThreshold: 50,
}

interface PhotoGalleryProps {
  photos: StagePhoto[]
  initialIndex: number
  onIndexChange: (index: number) => void
}

export function PhotoGallery({ photos, initialIndex, onIndexChange }: PhotoGalleryProps) {
  const { width: screenWidth } = useWindowDimensions()

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        onIndexChange(viewableItems[0].index)
      }
    },
    [onIndexChange]
  )

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: screenWidth,
      offset: screenWidth * index,
      index,
    }),
    [screenWidth]
  )

  const renderPhoto = useCallback(
    ({ item }: { item: StagePhoto }) => (
      <View style={[styles.photoContainer, { width: screenWidth }]}>
        <Image
          source={{ uri: item.photo_url }}
          style={[styles.photo, { width: screenWidth }]}
          resizeMode="contain"
        />
      </View>
    ),
    [screenWidth]
  )

  const keyExtractor = useCallback((item: StagePhoto) => item.id, [])

  return (
    <FlatList
      data={photos}
      renderItem={renderPhoto}
      keyExtractor={keyExtractor}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      initialScrollIndex={initialIndex}
      getItemLayout={getItemLayout}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      style={styles.gallery}
    />
  )
}

const styles = StyleSheet.create({
  gallery: {
    flex: 1,
  },
  photoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    flex: 1,
  },
})
