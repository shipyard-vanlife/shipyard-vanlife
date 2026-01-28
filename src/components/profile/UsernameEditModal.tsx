import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useUpdateUsername } from '../../hooks/useProfiles'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface UsernameEditModalProps {
  visible: boolean
  onClose: () => void
  currentFirstname: string | null
  currentLastname: string | null
  lastUpdated: string | null
}

const canChangeUsername = (lastUpdated: string | null): boolean => {
  if (!lastUpdated) return true

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceUpdate >= 30
}

const daysRemaining = (lastUpdated: string): number => {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  )

  return Math.max(0, 30 - daysSinceUpdate)
}

export const UsernameEditModal: React.FC<UsernameEditModalProps> = ({
  visible,
  onClose,
  currentUsername,
  lastUpdated,
}) => {
  const { t } = useTranslation(['profile', 'common'])
  const { mutate: updateUsername, isPending } = useUpdateUsername()
  const [newUsername, setNewUsername] = useState(currentUsername)

  const canChange = canChangeUsername(lastUpdated)
  const daysLeft = lastUpdated ? daysRemaining(lastUpdated) : 0

  useEffect(() => {
    if (visible) {
      setNewUsername(currentUsername)
    }
  }, [visible, currentUsername])

  const handleSave = () => {
    if (!newUsername.trim()) {
      Alert.alert('Erreur', 'Le pseudo ne peut pas être vide')
      return
    }

    if (newUsername === currentUsername) {
      onClose()
      return
    }

    updateUsername(newUsername.trim(), {
      onSuccess: () => {
        Alert.alert('Succès', 'Pseudo modifié !')
        onClose()
      },
      onError: error => {
        Alert.alert('Erreur', error.message)
      },
    })
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Modifier le pseudo</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {!canChange && (
              <View style={styles.warningBox}>
                <Ionicons name="time-outline" size={20} color={colors.text.tertiary} />
                <Text style={styles.warningText}>
                  Tu pourras changer ton pseudo dans {daysLeft} jour{daysLeft > 1 ? 's' : ''}
                </Text>
              </View>
            )}

            <TextInput
              style={[styles.input, !canChange && styles.inputDisabled]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="Ton pseudo"
              editable={canChange && !isPending}
              maxLength={30}
            />

            <Text style={styles.info}>Tu ne peux changer ton pseudo qu'une fois par mois</Text>

            <TouchableOpacity
              style={[styles.saveButton, (!canChange || isPending) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={!canChange || isPending}
            >
              {isPending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Enregistrer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    width: '85%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text.secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  inputDisabled: {
    backgroundColor: colors.primary.main,
    color: colors.text.tertiary,
  },
  info: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.secondary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.5,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
})
