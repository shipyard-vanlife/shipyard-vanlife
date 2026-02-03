import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight } from '../../styles/theme'

type EmptyStateVariant = 'friends' | 'groups' | 'requests'

const VARIANT_CONFIG: Record<EmptyStateVariant, string> = {
  friends: 'people-outline',
  groups: 'chatbubbles-outline',
  requests: 'mail-outline',
}

interface ChatEmptyStateProps {
  variant: EmptyStateVariant
}

export const ChatEmptyState = memo(function ChatEmptyState({ variant }: ChatEmptyStateProps) {
  const { t } = useTranslation(['chat'])

  return (
    <View style={styles.container}>
      <Ionicons
        name={VARIANT_CONFIG[variant] as any}
        size={64}
        color={colors.text.tertiary}
      />
      <Text style={styles.title}>{t(`empty.${variant}.title`)}</Text>
      <Text style={styles.message}>{t(`empty.${variant}.message`)}</Text>
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
})
