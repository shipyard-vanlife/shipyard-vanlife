import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme'
import { HelpRequest } from '../types/chat'

interface HelpRequestCardProps {
  request: HelpRequest
  isMyRequest: boolean
  requesterName: string
  onAccept?: () => void
  onDecline?: () => void
  onCancel?: () => void
  isResponding?: boolean
}

export const HelpRequestCard: React.FC<HelpRequestCardProps> = ({
  request,
  isMyRequest,
  requesterName,
  onAccept,
  onDecline,
  onCancel,
  isResponding = false,
}) => {
  if (request.status === 'accepted') {
    return (
      <View style={[styles.card, styles.cardAccepted]}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isMyRequest ? 'Demande acceptée !' : `Tu as accepté d'aider ${requesterName}`}
          </Text>
          <Text style={styles.skill}>{request.skill_requested}</Text>
        </View>
      </View>
    )
  }

  if (request.status === 'declined') {
    return (
      <View style={[styles.card, styles.cardDeclined]}>
        <View style={styles.iconContainer}>
          <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isMyRequest ? 'Demande refusée' : `Tu as refusé d'aider ${requesterName}`}
          </Text>
          <Text style={styles.skill}>{request.skill_requested}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.card, styles.cardPending]}>
      <View style={styles.iconContainer}>
        <Ionicons name="help-circle" size={24} color={colors.secondary.main} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isMyRequest
            ? `Tu as demandé de l'aide`
            : `${requesterName} a besoin d'aide`}
        </Text>
        <Text style={styles.skill}>{request.skill_requested}</Text>

        {isMyRequest ? (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={isResponding}
          >
            {isResponding ? (
              <ActivityIndicator size="small" color={colors.text.tertiary} />
            ) : (
              <Text style={styles.cancelText}>Annuler</Text>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.acceptButton]}
              onPress={onAccept}
              disabled={isResponding}
            >
              {isResponding ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color={colors.white} />
                  <Text style={styles.buttonText}>Accepter</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.declineButton]}
              onPress={onDecline}
              disabled={isResponding}
            >
              <Ionicons name="close" size={18} color={colors.text.secondary} />
              <Text style={styles.declineText}>Refuser</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  cardPending: {
    backgroundColor: colors.primary.main,
    borderWidth: 1,
    borderColor: colors.secondary.main,
  },
  cardAccepted: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: colors.success,
  },
  cardDeclined: {
    backgroundColor: colors.primary.main,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  iconContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  skill: {
    fontSize: fontSize.base,
    color: colors.secondary.main,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  acceptButton: {
    backgroundColor: colors.secondary.main,
  },
  declineButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  declineText: {
    color: colors.text.secondary,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    color: colors.text.tertiary,
    fontSize: fontSize.sm,
  },
})
