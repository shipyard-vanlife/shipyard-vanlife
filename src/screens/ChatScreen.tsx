import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMyFriends, useConnectionRequests, useAcceptConnection, useRejectConnection, useDeleteConnection } from '../hooks/useConnections'
import { useRealtimeConnections } from '../hooks/useRealtimeConnections'
import { Friend, ConnectionRequest } from '../types/chat'
import { FriendProfileModal } from '../components/FriendProfileModal'
import { ConversationScreen } from './ConversationScreen'
import { colors } from '../styles/theme'

type ChatTab = 'friends' | 'requests'

export const ChatScreen: React.FC = () => {
  const { t } = useTranslation('common')
  const [activeTab, setActiveTab] = useState<ChatTab>('friends')
  const [selectedFriend, setSelectedFriend] = useState<{ friendId: string; connectionId: string } | null>(null)
  const [openConversation, setOpenConversation] = useState<{
    connectionId: string
    friendName: string
    friendAvatar: string | null
    friendId: string
  } | null>(null)

  const { data: friends, isLoading: loadingFriends, refetch: refetchFriends } = useMyFriends()
  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useConnectionRequests()
  const { mutate: acceptConnection } = useAcceptConnection()
  const { mutate: rejectConnection } = useRejectConnection()
  const { mutate: deleteConnection } = useDeleteConnection()

  // le realtime pour les connexions
  useRealtimeConnections()

  // Refetch data when switching tabs
  useEffect(() => {
    if (activeTab === 'friends') {
      refetchFriends()
    } else {
      refetchRequests()
    }
  }, [activeTab])

  const renderFriendItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <TouchableOpacity
        onPress={() => {
          if (item.status === 'accepted') {
            setSelectedFriend({ friendId: item.friend_id, connectionId: item.connection_id })
          }
        }}
      >
        {item.friend_avatar_url ? (
          <Image source={{ uri: item.friend_avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.friendText}
        onPress={() => {
          if (item.status === 'accepted') {
            setOpenConversation({
              connectionId: item.connection_id,
              friendName: item.friend_username,
              friendAvatar: item.friend_avatar_url,
              friendId: item.friend_id,
            })
          }
        }}
      >
        <View style={styles.friendNameRow}>
          <Text style={styles.friendName}>{item.friend_username}</Text>
          {item.status === 'pending' && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingText}>En cours</Text>
            </View>
          )}
        </View>
        {item.last_message ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message}
          </Text>
        ) : (
          <Text style={styles.noMessage}>
            {item.status === 'pending' ? 'Demande envoyée' : 'Aucun message'}
          </Text>
        )}
      </TouchableOpacity>

      {item.status === 'pending' ? (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => deleteConnection(item.connection_id)}
        >
          <Ionicons name="close" size={18} color={colors.text.tertiary} />
        </TouchableOpacity>
      ) : item.unread_count > 0 ? (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      ) : null}
    </View>
  )

  const renderRequestItem = ({ item }: { item: ConnectionRequest }) => (
    <View style={styles.requestCard}>
      {/* Avatar cliquable pour voir le profil */}
      <TouchableOpacity
        onPress={() => {
          setSelectedFriend({ friendId: item.sender_id, connectionId: item.connection_id })
        }}
      >
        {item.sender_avatar_url ? (
          <Image source={{ uri: item.sender_avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Info de la demande */}
      <View style={styles.requestText}>
        <Text style={styles.requestName}>{item.sender_username}</Text>
        <Text style={styles.requestDate}>
          {new Date(item.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => acceptConnection(item.connection_id)}
        >
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => rejectConnection(item.connection_id)}
        >
          <Ionicons name="close" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderContent = () => {
    if (activeTab === 'friends') {
      if (loadingFriends) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }

      if (!friends || friends.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="people-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Aucun ami</Text>
            <Text style={styles.emptyText}>
              Envoie des demandes de connexion depuis la carte !
            </Text>
          </View>
        )
      }

      return (
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.connection_id}
          contentContainerStyle={styles.listContent}
        />
      )
    } else {
      if (loadingRequests) {
        return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.secondary.main} />
          </View>
        )
      }

      if (!requests || requests.length === 0) {
        return (
          <View style={styles.centerContainer}>
            <Ionicons name="mail-outline" size={64} color={colors.text.tertiary} />
            <Text style={styles.emptyTitle}>Aucune demande</Text>
            <Text style={styles.emptyText}>
              Tu n'as pas de demandes de connexion en attente
            </Text>
          </View>
        )
      }

      return (
        <FlatList
          data={requests}
          renderItem={renderRequestItem}
          keyExtractor={item => item.connection_id}
          contentContainerStyle={styles.listContent}
        />
      )
    }
  }

  if (openConversation) {
    return (
      <ConversationScreen
        route={{
          params: {
            connectionId: openConversation.connectionId,
            friendName: openConversation.friendName,
            friendAvatar: openConversation.friendAvatar,
            friendId: openConversation.friendId,
          },
        }}
        navigation={{
          goBack: () => setOpenConversation(null),
        }}
      />
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Amis
            {friends && friends.length > 0 && (
              <Text style={styles.tabBadge}> ({friends.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Demandes
            {requests && requests.length > 0 && (
              <Text style={styles.tabBadge}> ({requests.length})</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{renderContent()}</View>

      <FriendProfileModal
        friendId={selectedFriend?.friendId ?? null}
        connectionId={selectedFriend?.connectionId ?? null}
        onClose={() => setSelectedFriend(null)}
        onOpenConversation={(connectionId, friendName, friendAvatar) => {
          const friend = friends?.find(f => f.connection_id === connectionId)
          setSelectedFriend(null)
          setOpenConversation({
            connectionId,
            friendName,
            friendAvatar,
            friendId: friend?.friend_id || ''
          })
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 0,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.secondary.main,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    color: colors.secondary.main,
  },
  tabBadge: {
    fontSize: 14,
    fontWeight: '400',
  },
  content: {
    flex: 1,
    backgroundColor: colors.white,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  listContent: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendText: {
    flex: 1,
  },
  friendNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pendingBadge: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pendingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary.main,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  noMessage: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  unreadBadge: {
    backgroundColor: colors.secondary.main,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: 12,
  },
  requestText: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 13,
    color: colors.text.tertiary,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: colors.text.tertiary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
  },
})
