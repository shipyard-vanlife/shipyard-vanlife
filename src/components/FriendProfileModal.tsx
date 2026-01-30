import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SkillBadge } from './SkillBadge'
import { ProfilePhotoGrid } from './profile/ProfilePhotoGrid'
import {
  useDeleteConnection,
  useCheckConnection,
  useAcceptConnection,
  useRejectConnection,
} from '../hooks/useConnections'
import { useProfileById, useMyProfile } from '../hooks/useProfiles'
import { colors } from '../styles/theme'

const SCREEN_HEIGHT = Dimensions.get('window').height

interface FriendProfileModalProps {
  friendId: string | null
  connectionId: string | null
  onClose: () => void
  onOpenConversation?: (
    connectionId: string,
    friendName: string,
    friendAvatar: string | null
  ) => void
}

export const FriendProfileModal: React.FC<FriendProfileModalProps> = ({
  friendId,
  connectionId,
  onClose,
  onOpenConversation,
}) => {
  const { t } = useTranslation(['home', 'common'])
  const [zoomedImage, setZoomedImage] = useState<string | null>(null)
  const { data: profile, isLoading } = useProfileById(friendId)
  const { data: connectionStatus } = useCheckConnection(friendId || '')
  const { mutate: deleteConnection, isPending: isDeleting } = useDeleteConnection()
  const { mutate: acceptConnection, isPending: isAccepting } = useAcceptConnection()
  const { mutate: rejectConnection, isPending: isRejecting } = useRejectConnection()
  const { data: myProfile } = useMyProfile()

  const handleAccept = () => {
    if (!connectionId) return

    // Block if user is not verified
    if (myProfile?.verification_status !== 'approved') {
      Alert.alert(t('common:verification.requiredTitle'), t('common:verification.requiredMessage'))
      return
    }

    acceptConnection(connectionId, {
      onSuccess: () => {
        Alert.alert(
          t('common:profile.friendAddedTitle'),
          t('common:profile.friendAddedMessage', { username: profile?.username })
        )
        onClose()
      },
      onError: () => {
        Alert.alert(t('common:errors.error'), t('common:connection.acceptError'))
      },
    })
  }

  const handleReject = () => {
    if (!connectionId) return

    Alert.alert(
      t('common:connection.rejectTitle'),
      t('common:connection.rejectMessage', {
        username: profile?.username ?? t('common:profile.notFound'),
      }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:connection.reject'),
          style: 'destructive',
          onPress: () => {
            rejectConnection(connectionId, {
              onSuccess: () => {
                Alert.alert(t('common:connection.rejectConfirmed'))
                onClose()
              },
              onError: () => {
                Alert.alert(t('common:errors.error'), t('common:connection.rejectError'))
              },
            })
          },
        },
      ]
    )
  }

  const handleRemoveFriend = () => {
    if (!connectionId) return

    Alert.alert(
      t('common:connection.removeFriendTitle'),
      t('common:connection.removeFriendMessage', {
        username: profile?.username ?? t('common:profile.notFound'),
      }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:connection.removeFriendButton'),
          style: 'destructive',
          onPress: () => {
            deleteConnection(connectionId, {
              onSuccess: () => {
                Alert.alert(
                  t('common:profile.friendRemovedTitle'),
                  t('common:profile.friendRemovedMessage')
                )
                onClose()
              },
              onError: () => {
                Alert.alert(t('common:errors.error'), t('common:profile.removeError'))
              },
            })
          },
        },
      ]
    )
  }

  const handleMessage = () => {
    if (!connectionId || !profile) return

    // Block if user is not verified
    if (myProfile?.verification_status !== 'approved') {
      Alert.alert(t('common:verification.requiredTitle'), t('common:verification.requiredMessage'))
      return
    }

    if (onOpenConversation) {
      // Fermer le modal et ouvrir la conversation
      onClose()
      onOpenConversation(connectionId, profile.username, profile.avatar_url)
    } else {
      Alert.alert(
        t('common:profile.openConversationTitle'),
        t('common:profile.openConversationMessage', { username: profile.username })
      )
    }
  }

  if (!friendId) return null

  return (
    <Modal visible={!!friendId} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('common:profile.title')}</Text>
          <View style={styles.closeButton} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        ) : !profile ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>{t('common:profile.notFound')}</Text>
          </View>
        ) : (
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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
              <View style={styles.headerInfo}>
                <Text style={styles.username}>{profile.username}</Text>
                {profile.van_name ? <Text style={styles.vanName}>{profile.van_name}</Text> : null}
              </View>
            </View>

            {/* Badges de compétences */}
            <View style={styles.skillsContainer}>
              {profile.skills.map(skill => (
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

            {/* Actions selon le statut de la connexion */}
            {connectionStatus?.status === 'accepted' && (
              <>
                {/* Bouton Message (seulement si ami) */}
                <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
                  <Ionicons name="chatbubble-outline" size={20} color={colors.secondary.main} />
                  <Text style={styles.messageText}>{t('common:connection.message')}</Text>
                </TouchableOpacity>

                {/* Bouton Retirer ami */}
                <TouchableOpacity
                  style={[styles.removeButton, isDeleting && styles.removeButtonDisabled]}
                  onPress={handleRemoveFriend}
                  disabled={isDeleting}
                >
                  <Ionicons name="person-remove" size={20} color={colors.white} />
                  <Text style={styles.removeText}>
                    {isDeleting
                      ? t('common:connection.removing')
                      : t('common:connection.removeFriendTitle')}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {connectionStatus?.status === 'pending' && (
              <>
                {/* Boutons Accepter et Refuser */}
                <TouchableOpacity
                  style={[styles.acceptButton, isAccepting && styles.acceptButtonDisabled]}
                  onPress={handleAccept}
                  disabled={isAccepting}
                >
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.acceptText}>
                    {isAccepting
                      ? t('common:connection.accepting')
                      : t('common:connection.acceptRequest')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.removeButton, isRejecting && styles.removeButtonDisabled]}
                  onPress={handleReject}
                  disabled={isRejecting}
                >
                  <Ionicons name="close-circle" size={20} color={colors.white} />
                  <Text style={styles.removeText}>
                    {isRejecting
                      ? t('common:connection.rejecting')
                      : t('common:connection.rejectRequest')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        )}

        {/* Image Zoom Modal */}
        <Modal
          visible={!!zoomedImage}
          transparent
          animationType="fade"
          onRequestClose={() => setZoomedImage(null)}
        >
          <View style={styles.zoomModalContainer}>
            <TouchableOpacity
              style={styles.zoomModalOverlay}
              activeOpacity={1}
              onPress={() => setZoomedImage(null)}
            >
              <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
                {zoomedImage && (
                  <Image
                    source={{ uri: zoomedImage }}
                    style={styles.zoomedImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomCloseButton} onPress={() => setZoomedImage(null)}>
                <Ionicons name="close" size={30} color={colors.white} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary.main,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  vanPhotoContainer: {
    width: '100%',
    height: 200,
    marginTop: 20,
    marginBottom: 20,
  },
  vanPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
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
  headerInfo: {
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
  messageButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  messageText: {
    color: colors.secondary.main,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  removeButtonDisabled: {
    opacity: 0.5,
  },
  removeText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  acceptText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  acceptButtonDisabled: {
    opacity: 0.5,
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
