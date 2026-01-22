import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, fontSize, fontWeight, spacing } from '../../../../../styles/theme'

const BUTTON_SIZE = 44
const CLOSE_ICON_SIZE = 28
const DELETE_ICON_SIZE = 24

interface ViewerHeaderProps {
  currentIndex: number
  totalCount: number
  onClose: () => void
  onDelete?: () => void
  isDeleting: boolean
}

export function ViewerHeader({
  currentIndex,
  totalCount,
  onClose,
  onDelete,
  isDeleting,
}: ViewerHeaderProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={onClose}
        accessibilityLabel="Close"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={CLOSE_ICON_SIZE} color={colors.white} />
      </TouchableOpacity>

      <Text style={styles.counter}>
        {currentIndex + 1} / {totalCount}
      </Text>

      {onDelete ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onDelete}
          disabled={isDeleting}
          accessibilityLabel="Delete photo"
          accessibilityRole="button"
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="trash-outline" size={DELETE_ICON_SIZE} color={colors.white} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counter: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.white,
  },
  placeholder: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
  },
})
