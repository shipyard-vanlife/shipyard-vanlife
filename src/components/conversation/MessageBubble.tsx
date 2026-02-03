import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme'
import { formatTime } from '../../utils/formatDate'
import type { Message } from '../../types/chat'

interface MessageBubbleProps {
  message: Message
  isMyMessage: boolean
}

export const MessageBubble = memo(function MessageBubble({
  message,
  isMyMessage,
}: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myContainer : styles.theirContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isMyMessage ? styles.myBubble : styles.theirBubble,
        ]}
      >
        <Text style={[styles.text, isMyMessage ? styles.myText : styles.theirText]}>
          {message.content}
        </Text>
        <Text style={[styles.time, isMyMessage ? styles.myTime : styles.theirTime]}>
          {formatTime(message.created_at)}
        </Text>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myContainer: {
    alignSelf: 'flex-end',
  },
  theirContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  myBubble: {
    backgroundColor: colors.secondary.main,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: fontSize.base,
    lineHeight: 20,
  },
  myText: {
    color: colors.white,
  },
  theirText: {
    color: colors.text.primary,
  },
  time: {
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
  },
  myTime: {
    color: colors.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  theirTime: {
    color: colors.text.tertiary,
  },
})
