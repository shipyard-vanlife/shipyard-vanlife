import { Ionicons } from '@expo/vector-icons'
import React, { useRef, useState } from 'react'
import {
  Animated,
  Dimensions,
  PanResponder,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { useConnectionHandlers } from '../hooks'
import { useProfileById } from '../hooks/useProfiles'
import { colors } from '../styles/theme'
import { NearbyProfile } from '../types/location'
import { SkillBadge } from './SkillBadge'
import { BottomSheetActions, BottomSheetHeader, BottomSheetStats } from './bottom-sheet'
import { ProfilePhotoGrid } from './profile/ProfilePhotoGrid'
import { ImageZoomModal } from './shared'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MIN_HEIGHT = 120
const MAX_HEIGHT = SCREEN_HEIGHT * 0.95

interface BottomSheetProps {
  profile: NearbyProfile
  onClose?: () => void
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ profile, onClose }) => {
  const scrollViewRef = useRef<ScrollView>(null)
  const [sheetHeight] = useState(new Animated.Value(MIN_HEIGHT))
  const [isClosing, setIsClosing] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const { data: freshProfile } = useProfileById(profile.id)

  const {
    handleConnect,
    handleAccept,
    handleReject,
    handleRemoveFriend,
    connectionStatus,
    isReceivedRequest,
    isLoading,
  } = useConnectionHandlers({
    profileId: profile.id,
    username: freshProfile?.username ?? profile.username,
  })

  const displayProfile = freshProfile ?? {
    ...profile,
    bio: null,
    photos: [],
    total_distance_km: 0,
    is_visible: true,
    created_at: '',
    verification_status: null,
    connections_count: profile.connections_count ?? 0,
  }

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
        if (isClosing || gesture.dy > 0) return
        const newHeight = MIN_HEIGHT - gesture.dy
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          sheetHeight.setValue(newHeight)
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosing || gesture.dy > 0) return

        if (gesture.dy < -50) {
          Animated.spring(sheetHeight, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        } else {
          Animated.spring(sheetHeight, {
            toValue: MIN_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        }
      },
    })
  ).current

  return (
    <Animated.View style={[styles.container, { height: sheetHeight }]}>
      <View style={styles.handleContainer} {...panResponder.panHandlers}>
        <View style={styles.handle} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.contentContainer}>
          <BottomSheetHeader
            avatarUrl={displayProfile.avatar_url}
            username={displayProfile.username}
            vanName={displayProfile.van_name}
            vanPhotoUrl={displayProfile.van_photo_url}
            onVanPhotoPress={setZoomedImage}
          />

          <View style={styles.skillsContainer}>
            {displayProfile.skills.map(skill => (
              <SkillBadge key={skill} skill={skill} />
            ))}
          </View>

          <BottomSheetStats
            city={displayProfile.city}
            daysOnRoad={displayProfile.days_on_road}
            connectionsCount={displayProfile.connections_count}
          />

          {displayProfile.photos && displayProfile.photos.length > 0 && (
            <ProfilePhotoGrid
              photos={displayProfile.photos}
              isOwnProfile={false}
              onPhotoPress={setZoomedImage}
            />
          )}

          <BottomSheetActions
            connectionStatus={connectionStatus}
            isReceivedRequest={isReceivedRequest}
            isLoading={isLoading}
            onConnect={handleConnect}
            onAccept={handleAccept}
            onReject={handleReject}
            onRemoveFriend={handleRemoveFriend}
          />
        </View>
      </ScrollView>

      {onClose && (
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          disabled={isClosing}
        >
          <Ionicons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      )}

      <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
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
    paddingVertical: 12,
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
    right: 16,
    top: 16,
    padding: 8,
    backgroundColor: colors.primary.main,
    borderRadius: 20,
    zIndex: 9999,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
})
