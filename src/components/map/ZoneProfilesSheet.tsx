import React, { memo, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../../styles/theme'
import type { NearbyProfile } from '../../types/location'
import { ZoneProfileCard } from './ZoneProfileCard'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const SNAP_POINTS = {
  COLLAPSED: SCREEN_HEIGHT * 0.3,
  HALF: SCREEN_HEIGHT * 0.52,
  EXPANDED: SCREEN_HEIGHT * 0.85,
}

interface ZoneProfilesSheetProps {
  profiles: NearbyProfile[]
  count: number
  isLoading: boolean
  onProfileSelect: (profile: NearbyProfile) => void
  onClose: () => void
}

export const ZoneProfilesSheet = memo<ZoneProfilesSheetProps>(function ZoneProfilesSheet({
  profiles,
  count,
  isLoading,
  onProfileSelect,
  onClose,
}) {
  const { t } = useTranslation('home')
  const insets = useSafeAreaInsets()

  // Animated height — starts at 0, springs to HALF on mount
  const [sheetHeight] = useState(new Animated.Value(0))
  const [isClosing, setIsClosing] = useState(false)

  // Refs for gesture tracking
  const startHeightRef = useRef(SNAP_POINTS.HALF)
  const isClosingRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    isClosingRef.current = isClosing
  }, [isClosing])

  // Spring open on mount
  useEffect(() => {
    Animated.spring(sheetHeight, {
      toValue: SNAP_POINTS.EXPANDED,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start()
  }, [])

  // Close with timing animation
  const handleClose = () => {
    if (isClosingRef.current) return
    isClosingRef.current = true
    setIsClosing(true)
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => onClose())
  }

  // PanResponder for drag gestures on the handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 15,
      onPanResponderGrant: () => {
        startHeightRef.current = (sheetHeight as any)._value || SNAP_POINTS.HALF
      },
      onPanResponderMove: (_, gesture) => {
        if (isClosingRef.current) return

        const newHeight = startHeightRef.current - gesture.dy
        const clampedHeight = Math.max(
          SNAP_POINTS.COLLAPSED * 0.8,
          Math.min(SNAP_POINTS.EXPANDED, newHeight)
        )
        sheetHeight.setValue(clampedHeight)
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosingRef.current) return

        const currentHeight = (sheetHeight as any)._value || SNAP_POINTS.HALF

        if (gesture.vy > 1.5) {
          // Very fast swipe down → close
          isClosingRef.current = true
          setIsClosing(true)
          Animated.timing(sheetHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start(() => onClose())
          return
        }

        let targetHeight = SNAP_POINTS.HALF

        if (gesture.vy > 0.5) {
          // Fast swipe down → snap to lower point
          if (currentHeight > SNAP_POINTS.HALF) {
            targetHeight = SNAP_POINTS.HALF
          } else {
            targetHeight = SNAP_POINTS.COLLAPSED
          }
        } else if (gesture.vy < -0.5) {
          // Fast swipe up → expand
          targetHeight = SNAP_POINTS.EXPANDED
        } else {
          // Slow drag → snap to nearest point
          const points = [SNAP_POINTS.COLLAPSED, SNAP_POINTS.HALF, SNAP_POINTS.EXPANDED]
          targetHeight = points.reduce((prev, curr) =>
            Math.abs(curr - currentHeight) < Math.abs(prev - currentHeight) ? curr : prev
          )
        }

        Animated.spring(sheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          tension: 65,
          friction: 10,
        }).start()
      },
    })
  ).current

  return (
    <Animated.View
      style={[styles.container, { height: sheetHeight, paddingBottom: insets.bottom }]}
    >
      {/* Draggable handle */}
      <View style={styles.handleContainer} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.countBubble}>
            <Ionicons name="people" size={16} color={colors.white} />
            <Text style={styles.countText}>{count}</Text>
          </View>
          <Text style={styles.title}>{t('map.zone.title', { count })}</Text>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          disabled={isClosing}
        >
          <Ionicons name="close" size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Content */}
      {isLoading ? (
        <View style={styles.stateContainer}>
          <View style={styles.loadingDot}>
            <ActivityIndicator size="small" color={colors.secondary.main} />
          </View>
          <Text style={styles.stateText}>{t('map.zone.loading')}</Text>
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.stateContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="search-outline" size={28} color={colors.text.tertiary} />
          </View>
          <Text style={styles.stateText}>{t('map.zone.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <ZoneProfileCard profile={item} onPress={() => onProfileSelect(item)} />
          )}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        />
      )}
    </Animated.View>
  )
})

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: borderRadius.round,
    borderTopRightRadius: borderRadius.round,
    ...shadows.large,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
  },
  handleContainer: {
    width: '100%',
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: borderRadius.round,
    borderTopRightRadius: borderRadius.round,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.tertiary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  countBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary.main,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    ...shadows.small,
  },
  countText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  loadingDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.muted,
  },
})
