import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '../shared/UserAvatar'
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../../styles/theme'
import type { ConnectionRequest } from '../../types/chat'

interface ChatRequestCardProps {
  request: ConnectionRequest
  onAvatarPress: () => void
  onAccept: () => void
  onReject: () => void
}

export const ChatRequestCard = memo(function ChatRequestCard({
  request,
  onAvatarPress,
  onAccept,
  onReject,
}: ChatRequestCardProps) {
  return (
    <View style={styles.card}>
      <UserAvatar uri={request.sender_avatar_url} size={50} onPress={onAvatarPress} />

      <View style={styles.textSection}>
        <Text style={styles.name}>{request.sender_username}</Text>
        <Text style={styles.date}>
          {new Date(request.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
          <Ionicons name="close" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary.main,
    gap: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  date: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
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
})
