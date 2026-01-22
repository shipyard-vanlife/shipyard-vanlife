import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors, spacing } from '../../../../../styles/theme'

const DOT_SIZE = 8
const DOT_ACTIVE_SIZE = 10

interface DotsIndicatorProps {
  count: number
  activeIndex: number
}

export function DotsIndicator({ count, activeIndex }: DotsIndicatorProps) {
  if (count <= 1) {
    return null
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, index === activeIndex && styles.dotActive]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: DOT_ACTIVE_SIZE,
    height: DOT_ACTIVE_SIZE,
    borderRadius: DOT_ACTIVE_SIZE / 2,
  },
})
