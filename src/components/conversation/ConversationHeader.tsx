import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { UserAvatar } from '../shared/UserAvatar'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

interface ConversationHeaderProps {
  friendName: string
  friendAvatar: string | null
  onBack: () => void
  onAvatarPress: () => void
  onHelpPress: () => void
  avatarDisabled?: boolean
}

export const ConversationHeader = memo(function ConversationHeader({
  friendName,
  friendAvatar,
  onBack,
  onAvatarPress,
  onHelpPress,
  avatarDisabled = false,
}: ConversationHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
      </TouchableOpacity>

      <View style={styles.info}>
        <UserAvatar
          uri={friendAvatar}
          size={36}
          borderColor={colors.secondary.main}
          borderWidth={2}
          onPress={avatarDisabled ? undefined : onAvatarPress}
        />
        <Text style={styles.title}>{friendName}</Text>
      </View>

      <TouchableOpacity style={styles.helpButton} onPress={onHelpPress}>
        <Ionicons name="help-circle-outline" size={28} color={colors.secondary.main} />
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  helpButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
