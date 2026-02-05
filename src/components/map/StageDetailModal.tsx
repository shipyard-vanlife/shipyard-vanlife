import { Ionicons } from '@expo/vector-icons'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, spacing } from '../../styles/theme'
import { TripOverlayStage } from '../../types/map'
import { formatDateLong } from '../../utils/formatDate'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

const SNAP_POINTS = {
  COLLAPSED: SCREEN_HEIGHT * 0.3,
  HALF: SCREEN_HEIGHT * 0.55,
  EXPANDED: SCREEN_HEIGHT * 0.85,
}

interface StageDetailModalProps {
  stage: TripOverlayStage | null
  tripName: string
  onClose: () => void
}

export const StageDetailModal: React.FC<StageDetailModalProps> = ({ stage, tripName, onClose }) => {
  const { t } = useTranslation('trips')
  const insets = useSafeAreaInsets()

  const [sheetHeight] = useState(new Animated.Value(0))
  const [isClosing, setIsClosing] = useState(false)
  const startHeightRef = useRef(SNAP_POINTS.EXPANDED)
  const isClosingRef = useRef(false)

  // Backdrop opacity derived from sheet height
  const backdropOpacity = sheetHeight.interpolate({
    inputRange: [0, SNAP_POINTS.EXPANDED],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  })

  // Animate open on mount / when stage changes
  useEffect(() => {
    if (stage) {
      setIsClosing(false)
      isClosingRef.current = false
      Animated.spring(sheetHeight, {
        toValue: SNAP_POINTS.EXPANDED,
        useNativeDriver: false,
        tension: 50,
        friction: 8,
      }).start()
    }
  }, [stage])

  useEffect(() => {
    isClosingRef.current = isClosing
  }, [isClosing])

  const handleClose = useCallback(() => {
    if (isClosingRef.current) return
    setIsClosing(true)
    isClosingRef.current = true
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onClose()
    })
  }, [onClose, sheetHeight])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 15,
      onPanResponderGrant: () => {
        startHeightRef.current = (sheetHeight as any)._value || SNAP_POINTS.EXPANDED
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
        const currentHeight = (sheetHeight as any)._value || SNAP_POINTS.EXPANDED

        if (gesture.vy > 1.5) {
          // Very fast swipe down -> close
          setIsClosing(true)
          isClosingRef.current = true
          Animated.timing(sheetHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onClose()
          })
          return
        }

        let targetHeight = SNAP_POINTS.EXPANDED

        if (gesture.vy > 0.5) {
          if (currentHeight > SNAP_POINTS.HALF) {
            targetHeight = SNAP_POINTS.HALF
          } else {
            targetHeight = SNAP_POINTS.COLLAPSED
          }
        } else if (gesture.vy < -0.5) {
          targetHeight = SNAP_POINTS.EXPANDED
        } else {
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

  if (!stage) return null

  const locationText = [stage.city, stage.country].filter(Boolean).join(', ')

  return (
    <>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View style={[styles.container, { height: sheetHeight }]}>
        {/* Drag handle */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          disabled={isClosing}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.stageTitle}>
              {t('map.stageDetail.title', { number: stage.stageOrder })}
            </Text>
            <Text style={styles.tripName} numberOfLines={1}>
              {tripName}
            </Text>
          </View>

          {/* Location */}
          {locationText ? (
            <View style={styles.section}>
              <View style={styles.sectionIcon}>
                <Ionicons name="location-outline" size={20} color={colors.secondary.main} />
              </View>
              <Text style={styles.sectionText}>{locationText}</Text>
            </View>
          ) : null}

          {/* Date */}
          <View style={styles.section}>
            <View style={styles.sectionIcon}>
              <Ionicons name="calendar-outline" size={20} color={colors.secondary.main} />
            </View>
            <View>
              <Text style={styles.sectionLabel}>{t('map.stageDetail.arrivedAt')}</Text>
              <Text style={styles.sectionText}>{formatDateLong(stage.arrivedAt)}</Text>
            </View>
          </View>

          {/* Note */}
          <View style={styles.noteSection}>
            <View style={styles.noteLabelRow}>
              <Ionicons name="document-text-outline" size={20} color={colors.secondary.main} />
              <Text style={styles.noteLabel}>{t('map.stageDetail.note')}</Text>
            </View>
            <Text style={[styles.noteText, !stage.note && styles.noNote]}>
              {stage.note ?? t('map.stageDetail.noNote')}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 9,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  handleContainer: {
    width: '100%',
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.tertiary.main,
    borderRadius: 3,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    zIndex: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 4,
    paddingBottom: 16,
    paddingRight: 48,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.main,
    marginBottom: 20,
  },
  stageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  tripName: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  sectionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  noteSection: {
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  noteLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  noteLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  noteText: {
    fontSize: 15,
    color: colors.text.primary,
    lineHeight: 22,
  },
  noNote: {
    fontStyle: 'italic',
    color: colors.text.tertiary,
  },
})
