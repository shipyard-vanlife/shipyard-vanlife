import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserProfile } from '../types/user'
import { SkillBadge } from './SkillBadge'
import { colors } from '../styles/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MIN_HEIGHT = 120
const MAX_HEIGHT = SCREEN_HEIGHT * 0.85

interface BottomSheetProps {
  profile: UserProfile
  onClose?: () => void
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ profile, onClose }) => {
  const { t } = useTranslation(['home', 'common'])
  const scrollViewRef = useRef<ScrollView>(null)
  const [sheetHeight] = useState(new Animated.Value(MIN_HEIGHT))
  const [isClosing, setIsClosing] = useState(false)

  const handleConnect = () => {
    // TODO: Implémenter la logique de connexion
    Alert.alert('Connexion', `Demande de connexion envoyée à ${profile.username}`)
  }

  const handleMessage = () => {
    // TODO: Implémenter la messagerie
    Alert.alert('Message', `Ouvrir la conversation avec ${profile.username}`)
  }

  const handleClose = () => {
    if (isClosing || !onClose) return
    setIsClosing(true)

    Animated.spring(sheetHeight, {
      toValue: 0,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start(() => {
      setTimeout(() => {
        onClose()
      }, 50)
    })
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        if (isClosing) return
        const newHeight = MIN_HEIGHT - gesture.dy
        if (newHeight >= 0 && newHeight <= MAX_HEIGHT) {
          sheetHeight.setValue(newHeight)
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosing) return

        if (gesture.dy < -50) {
          // Swipe up - expand
          Animated.spring(sheetHeight, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        } else if (gesture.dy > 50) {
          // Swipe down - close
          handleClose()
        } else {
          // Small movement - snap to closest position
          const currentHeight = MIN_HEIGHT - gesture.dy
          const target = currentHeight > (MIN_HEIGHT + MAX_HEIGHT) / 2 ? MAX_HEIGHT : MIN_HEIGHT
          Animated.spring(sheetHeight, {
            toValue: target,
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
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.contentContainer}>
          {/* Photo du van */}
          <View style={styles.vanPhotoContainer}>
            <Image
              source={require('../../assets/van-life.jpg')}
              style={styles.vanPhoto}
              resizeMode="cover"
            />
          </View>

          {/* Nom utilisateur + van */}
          <View style={styles.header}>
            <Text style={styles.username}>{profile.username}</Text>
            {profile.van_name ? <Text style={styles.vanName}>{profile.van_name}</Text> : null}
          </View>

          {/* Badge principal */}
          {profile.main_specialty ? (
            <View style={styles.mainBadgeContainer}>
              <SkillBadge skill={profile.main_specialty} isMain />
            </View>
          ) : null}
          
          {/* Autres badges */}
          <View style={styles.skillsContainer}>
            {profile.skills
              .filter(skill => skill !== profile.main_specialty)
              .map(skill => (
                <SkillBadge key={skill} skill={skill} />
              ))}
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.currentCity')}</Text>
              <Text style={styles.statValue}>{profile.city ?? '-'}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.daysOnRoad')}</Text>
              <Text style={styles.statValue}>{profile.days_on_road}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>{t('profile.connections')}</Text>
              <Text style={styles.statValue}>{profile.connections_count}</Text>
            </View>
          </View>

          {/* Actions pour interagir avec ce vanlifer */}
          <TouchableOpacity style={styles.connectButton} onPress={handleConnect}>
            <Ionicons name="person-add" size={20} color={colors.white} />
            <Text style={styles.connectText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.secondary.main} />
            <Text style={styles.messageText}>Envoyer un message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    position: 'relative',
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
    top: 8,
    padding: 8,
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
    paddingBottom: 5,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },
  vanPhotoContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    marginTop: 28,
  },
  vanPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  placeholderPhoto: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: '600',
  },
  header: {
    marginBottom: 16,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  vanName: {
    fontSize: 17,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  mainBadgeContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.primary.main,
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  connectButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  connectText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  messageText: {
    color: colors.secondary.main,
    fontSize: 16,
    fontWeight: '600',
  },
})
