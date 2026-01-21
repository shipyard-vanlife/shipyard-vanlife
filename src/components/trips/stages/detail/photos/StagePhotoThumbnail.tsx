import React from 'react'
import { StyleSheet, TouchableOpacity, Image, View, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, borderRadius, spacing } from '../../../../../styles/theme'

interface StagePhotoThumbnailProps {
  photoUrl: string
  onPress: () => void
  onLongPress?: () => void
  isLoading?: boolean
}

export function StagePhotoThumbnail({
  photoUrl,
  onPress,
  onLongPress,
  isLoading = false,
}: StagePhotoThumbnailProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.8}
    >
      <Image source={{ uri: photoUrl }} style={styles.image} resizeMode="cover" />
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={colors.white} />
        </View>
      ) : null}
      <View style={styles.expandIcon}>
        <Ionicons name="expand-outline" size={14} color={colors.white} />
      </View>
    </TouchableOpacity>
  )
}

interface AddPhotoButtonProps {
  onPress: () => void
  isLoading?: boolean
}

export function AddPhotoButton({ onPress, isLoading = false }: AddPhotoButtonProps) {
  return (
    <TouchableOpacity
      style={styles.addButton}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.text.muted} />
      ) : (
        <Ionicons name="add" size={32} color={colors.text.muted} />
      )}
    </TouchableOpacity>
  )
}

const THUMBNAIL_SIZE = 80

const styles = StyleSheet.create({
  container: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    backgroundColor: colors.border.light,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expandIcon: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.sm,
    padding: 2,
  },
  addButton: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.card,
  },
})
