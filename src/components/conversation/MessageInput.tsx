import React, { memo } from 'react'
import { ActivityIndicator, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, borderRadius, fontSize } from '../../styles/theme'

interface MessageInputProps {
  value: string
  onChange: (text: string) => void
  onSend: () => void
  isSending: boolean
  placeholder: string
}

export const MessageInput = memo(function MessageInput({
  value,
  onChange,
  onSend,
  isSending,
  placeholder,
}: MessageInputProps) {
  const disabled = !value.trim() || isSending

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        value={value}
        onChangeText={onChange}
        multiline
        textContentType="none"
        autoComplete="off"
        maxLength={1000}
      />
      <TouchableOpacity
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={onSend}
        disabled={disabled}
      >
        {isSending ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Ionicons name="send" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.primary.main,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
})
