import { useRef, useEffect, useCallback } from 'react'
import { Animated, PanResponder, PanResponderInstance } from 'react-native'

const CLOSE_THRESHOLD = 150
const OPACITY_THRESHOLD = 300
const ANIMATION_DURATION = 200
const SPRING_CONFIG = { tension: 100, friction: 10 }

interface UseDragToCloseOptions {
  enabled: boolean
  onClose: () => void
}

interface UseDragToCloseReturn {
  translateY: Animated.Value
  backgroundOpacity: Animated.Value
  panHandlers: PanResponderInstance['panHandlers']
}

/**
 * Hook for drag-to-close gesture on modals/viewers
 * Provides smooth animation when dragging down to dismiss
 */
export function useDragToClose({ enabled, onClose }: UseDragToCloseOptions): UseDragToCloseReturn {
  const translateY = useRef(new Animated.Value(0)).current
  const backgroundOpacity = useRef(new Animated.Value(1)).current

  // Reset animation values when enabled changes
  useEffect(() => {
    if (enabled) {
      translateY.setValue(0)
      backgroundOpacity.setValue(1)
    }
  }, [enabled, translateY, backgroundOpacity])

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose()
      translateY.setValue(0)
      backgroundOpacity.setValue(1)
    })
  }, [onClose, translateY, backgroundOpacity])

  const handleSnapBack = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        ...SPRING_CONFIG,
      }),
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()
  }, [translateY, backgroundOpacity])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical gestures (swipe down)
        const isVerticalGesture = Math.abs(gestureState.dy) > 10
        const isMoreVerticalThanHorizontal = Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
        return isVerticalGesture && isMoreVerticalThanHorizontal
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy)
          const opacity = Math.max(0, 1 - gestureState.dy / OPACITY_THRESHOLD)
          backgroundOpacity.setValue(opacity)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > CLOSE_THRESHOLD) {
          handleClose()
        } else {
          handleSnapBack()
        }
      },
    })
  ).current

  return {
    translateY,
    backgroundOpacity,
    panHandlers: panResponder.panHandlers,
  }
}
