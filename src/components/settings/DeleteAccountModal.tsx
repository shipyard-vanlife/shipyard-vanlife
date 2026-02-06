import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'

interface DeleteAccountModalProps {
  visible: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  const { t } = useTranslation(['settings', 'common'])
  const [confirmText, setConfirmText] = useState('')

  const expectedWord = t('settings:deleteAccount.confirmWord')
  const isConfirmValid = confirmText.trim().toUpperCase() === expectedWord.toUpperCase()

  const handleClose = useCallback(() => {
    setConfirmText('')
    onClose()
  }, [onClose])

  const handleConfirm = useCallback(() => {
    if (isConfirmValid && !isDeleting) {
      onConfirm()
    }
  }, [isConfirmValid, isDeleting, onConfirm])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={32} color={colors.error} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{t('settings:deleteAccount.title')}</Text>

          {/* Description */}
          <Text style={styles.description}>{t('settings:deleteAccount.description')}</Text>

          {/* Consequences list */}
          <View style={styles.consequencesList}>
            <Text style={styles.consequenceItem}>
              {'\u2022'} {t('settings:deleteAccount.consequence1')}
            </Text>
            <Text style={styles.consequenceItem}>
              {'\u2022'} {t('settings:deleteAccount.consequence2')}
            </Text>
            <Text style={styles.consequenceItem}>
              {'\u2022'} {t('settings:deleteAccount.consequence3')}
            </Text>
          </View>

          {/* Confirm input instruction */}
          <Text style={styles.inputLabel}>
            {t('settings:deleteAccount.inputLabel', { word: expectedWord })}
          </Text>

          <TextInput
            style={styles.input}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={expectedWord}
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isDeleting}
          />

          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={isDeleting}
            >
              <Text style={styles.cancelButtonText}>{t('common:buttons.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteButton, !isConfirmValid && styles.deleteButtonDisabled]}
              onPress={handleConfirm}
              disabled={!isConfirmValid || isDeleting}
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.white} size="small" />
              ) : (
                <Text style={styles.deleteButtonText}>{t('common:buttons.delete')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    width: '100%',
    maxWidth: 400,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  consequencesList: {
    backgroundColor: '#FEF2F2',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  consequenceItem: {
    fontSize: fontSize.sm,
    color: colors.error,
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: fontSize.sm,
    color: colors.text.primary,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.primary.main,
    marginBottom: spacing.xl,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
  },
  deleteButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
})
