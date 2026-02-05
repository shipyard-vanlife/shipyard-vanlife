import React, { useRef, useState, useCallback, useEffect } from 'react'
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons'

import { NearbyProfile } from '../../types/location'
import type { PublicTrip, PublicTripStage } from '../../types/trip'
import { ProfileContentView, ImageZoomModal } from '../shared'
import { ConnectionActionButtons } from './ConnectionActionButtons'
import { ModerationActions } from './ModerationActions'
import { ReportModal } from './ReportModal'

import { useConnectionHandlers } from '../../hooks'
import { useMyProfile, useProfileById } from '../../hooks/useProfiles'
import { useBlockUser } from '../../hooks/useModeration'

import { colors, spacing } from '../../styles/theme'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

// Snap points for the bottom sheet
const SNAP_POINTS = {
  COLLAPSED: 180,
  HALF: SCREEN_HEIGHT * 0.55,
  EXPANDED: SCREEN_HEIGHT * 0.92,
}

interface VisitorProfileSheetProps {
  /** Initial profile data from map/search (NearbyProfile with blurred coordinates) */
  profile?: NearbyProfile
  /** Alternative: load profile by ID (for chat/conversation screens) */
  profileId?: string
  /** Callback when sheet is closed */
  onClose?: () => void
  /** Callback to go back to previous context (e.g. zone list) */
  onBack?: () => void
  /** Callback to navigate to conversation */
  onMessage?: (connectionId: string) => void
  /** Callback when user wants to view a trip stage on map */
  onViewStageOnMap?: (stage: PublicTripStage, trip: PublicTrip) => void
  /** Callback when user wants to view all trip stages on map */
  onViewTripOnMap?: (trip: PublicTrip) => void
}

export const VisitorProfileSheet: React.FC<VisitorProfileSheetProps> = ({
  profile,
  profileId: profileIdProp,
  onClose,
  onBack,
  onMessage,
  onViewStageOnMap,
  onViewTripOnMap,
}) => {
  const { t } = useTranslation(['common', 'home'])

  // Resolve profile ID from either prop
  const resolvedId = profile?.id ?? profileIdProp ?? ''

  // Sheet animation - starts at 0 and animates to EXPANDED on mount
  const [sheetHeight] = useState(new Animated.Value(0))
  const [isClosing, setIsClosing] = useState(false)

  // Animate sheet opening on mount - opens fully expanded
  useEffect(() => {
    Animated.spring(sheetHeight, {
      toValue: SNAP_POINTS.EXPANDED,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start()
  }, [])
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Data hooks
  const { data: myProfile } = useMyProfile()
  const { data: fullProfile, isLoading: isLoadingProfile } = useProfileById(resolvedId || null)
  const { mutate: blockUser } = useBlockUser()

  // Use full profile if available, otherwise use initial NearbyProfile
  const displayProfile = fullProfile ?? profile ?? null

  const isVerified = myProfile?.verification_status === 'approved'

  // Use centralized connection handlers
  const {
    handleConnect,
    handleAccept,
    handleReject,
    handleRemoveFriend,
    connectionStatus,
    isLoading: connectionLoading,
  } = useConnectionHandlers({
    profileId: resolvedId,
    username: displayProfile?.username ?? '',
  })

  // Handlers
  const handleClose = useCallback(() => {
    if (isClosing || !onClose) return
    setIsClosing(true)
    Animated.timing(sheetHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onClose()
    })
  }, [isClosing, onClose, sheetHeight])

  const handleMessage = useCallback(() => {
    if (connectionStatus?.id && onMessage) {
      onMessage(connectionStatus.id)
    }
  }, [connectionStatus?.id, onMessage])

  const handleViewStageOnMap = useCallback(
    (stage: PublicTripStage, trip: PublicTrip) => {
      if (!isVerified) {
        Alert.alert(
          t('verification.mapBlockedTitle'),
          t('verification.mapBlockedMessage') + '\n' + t('verification.mapBlockedNote')
        )
        return
      }
      onViewStageOnMap?.(stage, trip)
    },
    [isVerified, onViewStageOnMap, t]
  )

  const handleViewTripOnMap = useCallback(
    (trip: PublicTrip) => {
      if (!isVerified) {
        Alert.alert(
          t('verification.mapBlockedTitle'),
          t('verification.mapBlockedMessage') + '\n' + t('verification.mapBlockedNote')
        )
        return
      }
      onViewTripOnMap?.(trip)
    },
    [isVerified, onViewTripOnMap, t]
  )

  const handleReport = useCallback(() => {
    setShowReportModal(true)
  }, [])

  const handleBlock = useCallback(() => {
    if (!resolvedId || !displayProfile) return
    Alert.alert(
      t('moderation.blockConfirmTitle', { username: displayProfile.username }),
      t('moderation.blockConfirmMessage'),
      [
        { text: t('buttons.cancel'), style: 'cancel' },
        {
          text: t('moderation.blockUser'),
          style: 'destructive',
          onPress: () => {
            blockUser(resolvedId, {
              onSuccess: () => {
                Alert.alert(
                  t('moderation.blockSuccess'),
                  t('moderation.blockSuccessMessage', { username: displayProfile.username })
                )
                handleClose()
              },
              onError: () => {
                Alert.alert(t('errors.generic'), t('moderation.blockError'))
              },
            })
          },
        },
      ]
    )
  }, [blockUser, resolvedId, displayProfile, handleClose, t])

  // Store starting height for drag gesture
  const startHeightRef = useRef(SNAP_POINTS.EXPANDED)
  const isClosingRef = useRef(false)

  // Keep ref in sync with state
  useEffect(() => {
    isClosingRef.current = isClosing
  }, [isClosing])

  // Pan responder for drag gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 15,
      onPanResponderGrant: () => {
        // Store current height at the start of the gesture
        startHeightRef.current = (sheetHeight as any)._value || SNAP_POINTS.EXPANDED
      },
      onPanResponderMove: (_, gesture) => {
        if (isClosingRef.current) return

        // Calculate new height based on start height and total displacement
        const newHeight = startHeightRef.current - gesture.dy

        // Clamp height with some resistance at boundaries
        const clampedHeight = Math.max(
          SNAP_POINTS.COLLAPSED * 0.8, // Allow slight overdrag down
          Math.min(SNAP_POINTS.EXPANDED, newHeight)
        )
        sheetHeight.setValue(clampedHeight)
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosingRef.current) return

        const currentHeight = (sheetHeight as any)._value || SNAP_POINTS.EXPANDED

        // Determine snap point based on velocity and position
        let targetHeight = SNAP_POINTS.EXPANDED

        if (gesture.vy > 1.5) {
          // Very fast swipe down -> close
          setIsClosing(true)
          Animated.timing(sheetHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start(() => {
            onClose?.()
          })
          return
        } else if (gesture.vy > 0.5) {
          // Fast swipe down -> go to lower snap point
          if (currentHeight > SNAP_POINTS.HALF) {
            targetHeight = SNAP_POINTS.HALF
          } else {
            targetHeight = SNAP_POINTS.COLLAPSED
          }
        } else if (gesture.vy < -0.5) {
          // Fast swipe up -> expand
          targetHeight = SNAP_POINTS.EXPANDED
        } else {
          // Slow drag -> snap to nearest point
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
    <>
      <Animated.View style={[styles.container, { height: sheetHeight }]}>
        {/* Handle for dragging */}
        <View style={styles.handleContainer} {...panResponder.panHandlers}>
          <View style={styles.handle} />
        </View>

        {/* Back button (e.g. back to zone list) */}
        {onBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            disabled={isClosing}
          >
            <Ionicons name="arrow-back" size={20} color={colors.white} />
          </TouchableOpacity>
        ) : null}

        {/* Close button */}
        {onClose ? (
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            activeOpacity={0.7}
            disabled={isClosing}
          >
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        ) : null}

        {/* Scrollable content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {displayProfile ? (
            <ProfileContentView
              profile={displayProfile}
              isLoading={isLoadingProfile}
              onPhotoPress={setZoomedImage}
              onViewStageOnMap={handleViewStageOnMap}
              onViewTripOnMap={handleViewTripOnMap}
              renderActions={() => (
                <ConnectionActionButtons
                  connectionStatus={connectionStatus ?? null}
                  myProfileId={myProfile?.id ?? null}
                  targetUsername={displayProfile.username}
                  isVerified={isVerified}
                  onConnect={handleConnect}
                  onAccept={handleAccept}
                  onReject={handleReject}
                  onRemoveFriend={handleRemoveFriend}
                  onMessage={handleMessage}
                  isSending={connectionLoading.sending}
                  isAccepting={connectionLoading.accepting}
                  isRejecting={connectionLoading.rejecting}
                  isRemoving={connectionLoading.removing}
                />
              )}
              renderModerationActions={() => (
                <ModerationActions onReport={handleReport} onBlock={handleBlock} />
              )}
            />
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.secondary.main} />
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Image zoom modal */}
      <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />

      {/* Report modal */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        userId={resolvedId}
        username={displayProfile?.username ?? ''}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    backgroundColor: colors.primary.main,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: colors.tertiary.main,
    borderRadius: 3,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary.main,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
    padding: spacing.sm,
    backgroundColor: colors.white,
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
})
