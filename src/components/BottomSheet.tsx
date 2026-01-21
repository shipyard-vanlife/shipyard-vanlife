import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
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
import { ProfilePhotoGrid } from './profile/ProfilePhotoGrid'
import { useSendConnectionRequest, useCheckConnection } from '../hooks/useConnections'
import { colors } from '../styles/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height
const MIN_HEIGHT = 120
const MAX_HEIGHT = SCREEN_HEIGHT * 0.95

interface BottomSheetProps {
  profile: UserProfile
  onClose?: () => void
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ profile, onClose }) => {
  const { t } = useTranslation(['home', 'common'])
  const scrollViewRef = useRef<ScrollView>(null)
  const [sheetHeight] = useState(new Animated.Value(MIN_HEIGHT))
  const [isClosing, setIsClosing] = useState(false)
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)

  const { mutate: sendRequest, isPending: sendingRequest } = useSendConnectionRequest()
  const { data: connectionStatus, refetch: refetchConnectionStatus } = useCheckConnection(profile.id)

  const handleConnect = async () => {
    console.log('🔵 handleConnect appelé pour user:', profile.id)

    try {
      // Force refresh du statut de connexion avant d'envoyer
      console.log('🔵 Vérification du statut...')
      const { data: freshStatus } = await refetchConnectionStatus()
      console.log('🔵 Statut actuel:', freshStatus)

      // Check if connection exists (freshStatus peut être un tableau vide, un objet, ou null)
      const hasConnection = freshStatus && (Array.isArray(freshStatus) ? freshStatus.length > 0 : freshStatus.status)

      if (hasConnection) {
        const status = Array.isArray(freshStatus) ? freshStatus[0]?.status : freshStatus.status
        console.log('🔵 Connexion existante avec statut:', status)

        if (status === 'pending') {
          Alert.alert('Demande en attente', 'Une demande de connexion est déjà en attente')
        } else if (status === 'accepted') {
          Alert.alert('Déjà connecté', `Tu es déjà connecté avec ${profile.username}`)
        } else if (status === 'rejected') {
          Alert.alert('Demande refusée', 'Cette personne a refusé ta demande de connexion')
        }
        return
      }

      console.log('🔵 Aucune connexion existante, envoi de la demande...')
      sendRequest(profile.id, {
        onSuccess: () => {
          console.log('✅ Demande envoyée avec succès')
          Alert.alert('Demande envoyée', `Demande de connexion envoyée à ${profile.username} !`)
          // Le cache est automatiquement invalidé par le hook useSendConnectionRequest
          // On force quand même un refetch du statut pour mettre à jour l'UI immédiatement
          setTimeout(() => refetchConnectionStatus(), 300)
        },
        onError: (error: any) => {
          console.error('❌ Connection request error:', error)
          refetchConnectionStatus()

          if (error?.message?.includes('Connection already exists')) {
            Alert.alert('Connexion existante', 'Une connexion existe déjà avec cet utilisateur. Actualise l\'app.')
          } else {
            Alert.alert('Erreur', 'Impossible d\'envoyer la demande de connexion')
          }
        },
      })
    } catch (error) {
      console.error('❌ Erreur dans handleConnect:', error)
      Alert.alert('Erreur', 'Une erreur est survenue')
    }
  }

  const handleMessage = () => {
    // TODO: Implémenter la messagerie - ouvrir ConversationScreen
    Alert.alert('Message', `Ouvrir la conversation avec ${profile.username}`)
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
        if (isClosing || gesture.dy > 0) return // Only allow swipe UP
        const newHeight = MIN_HEIGHT - gesture.dy
        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          sheetHeight.setValue(newHeight)
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (isClosing || gesture.dy > 0) return // Only handle swipe UP

        if (gesture.dy < -50) {
          // Swipe up - expand to max
          Animated.spring(sheetHeight, {
            toValue: MAX_HEIGHT,
            useNativeDriver: false,
            tension: 50,
            friction: 8,
          }).start()
        } else {
          // Small movement - return to MIN
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
          {/* Photo du van */}
          {profile.van_photo_url && (
            <TouchableOpacity
              style={styles.vanPhotoContainer}
              onPress={() => setZoomedImage(profile.van_photo_url)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: profile.van_photo_url }}
                style={styles.vanPhoto}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}

          {/* Avatar + Nom utilisateur + van */}
          <View style={styles.headerContainer}>
            {profile.avatar_url && (
              <Image
                source={{ uri: profile.avatar_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            )}
            <View style={styles.header}>
              <Text style={styles.username}>{profile.username}</Text>
              {profile.van_name ? <Text style={styles.vanName}>{profile.van_name}</Text> : null}
            </View>
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

          {/* Photos gallery */}
          {profile.photos && profile.photos.length > 0 && (
            <ProfilePhotoGrid
              photos={profile.photos}
              isOwnProfile={false}
              onPhotoPress={setZoomedImage}
            />
          )}

          {/* Actions pour interagir avec ce vanlifer */}
          <TouchableOpacity
            style={[
              styles.connectButton,
              (sendingRequest || connectionStatus?.status === 'accepted' || connectionStatus?.status === 'pending') && styles.connectButtonDisabled
            ]}
            onPress={handleConnect}
            disabled={sendingRequest || connectionStatus?.status === 'accepted' || connectionStatus?.status === 'pending'}
          >
            <Ionicons
              name={
                connectionStatus?.status === 'accepted'
                  ? 'checkmark-circle'
                  : connectionStatus?.status === 'pending'
                  ? 'time'
                  : 'person-add'
              }
              size={20}
              color={colors.white}
            />
            <Text style={styles.connectText}>
              {connectionStatus?.status === 'accepted'
                ? 'Est votre ami'
                : connectionStatus?.status === 'pending'
                ? 'Demande envoyée'
                : sendingRequest
                ? 'Envoi en cours...'
                : 'Se connecter'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.secondary.main} />
            <Text style={styles.messageText}>Envoyer un message</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Close button - fixed position on top */}
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

      {/* Image Zoom Modal */}
      <Modal visible={!!zoomedImage} transparent animationType="fade" onRequestClose={() => setZoomedImage(null)}>
        <View style={styles.zoomModalContainer}>
          <TouchableOpacity style={styles.zoomModalOverlay} activeOpacity={1} onPress={() => setZoomedImage(null)}>
            <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
              {zoomedImage && <Image source={{ uri: zoomedImage }} style={styles.zoomedImage} resizeMode="contain" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomCloseButton} onPress={() => setZoomedImage(null)}>
              <Ionicons name="close" size={30} color={colors.white} />
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </Modal>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: colors.secondary.main,
  },
  header: {
    flex: 1,
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
  connectButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.7,
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
  zoomModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  zoomModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomedImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  zoomCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
})
