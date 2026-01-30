import { useRef, useState } from 'react'
import { Animated, PanResponder, PanResponderInstance } from 'react-native'

interface UseBottomSheetGestureOptions {
  minHeight: number
  maxHeight: number
  onClose?: () => void
}

interface UseBottomSheetGestureResult {
  sheetHeight: Animated.Value
  panResponder: PanResponderInstance
  isClosing: boolean
  setIsClosing: (value: boolean) => void
  handleClose: () => void
}

export function useBottomSheetGesture(
  options: UseBottomSheetGestureOptions
): UseBottomSheetGestureResult {
  const { minHeight, maxHeight, onClose } = options

  const [sheetHeight] = useState(new Animated.Value(minHeight))
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    if (isClosing || !onClose) return
    setIsClosing(true)
    onClose()
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy < 0 && Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (isClosing || gesture.dy > 0) return // Only allow swipe UP
        const newHeight = minHeight - gesture.dy
        if (newHeight >= minHeight && newHeight <= maxHeight) {
          sheetHeight.setValue(newHeight)
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosing || gesture.dy > 0) return // Only handle swipe UP

        if (gesture.dy < -50) {
          // Swipe up - expand to max
          Animated.spring(sheetHeight, {
            toValue: maxHeight,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        } else {
          // Small movement - return to MIN
          Animated.spring(sheetHeight, {
            toValue: minHeight,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        }
      },
    })
  ).current

  return {
    sheetHeight,
    panResponder,
    isClosing,
    setIsClosing,
    handleClose,
  }
}
