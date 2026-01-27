import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react-native'
import { colors, fontSize, fontWeight, spacing, borderRadius, shadows } from '../styles/theme'
import { useUseInvitationCode } from '../hooks/useInvitations'

interface InvitationCodeScreenProps {
  onSuccess: () => void
  onBack: () => void
}

export const InvitationCodeScreen: React.FC<InvitationCodeScreenProps> = ({
  onSuccess,
  onBack,
}) => {
  const { t } = useTranslation(['invitation', 'common'])
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const useCodeMutation = useUseInvitationCode()

  const formatCode = (input: string): string => {
    // Remove all non-alphanumeric characters
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '')

    // If already has VAN prefix or starts with V, handle it
    if (cleaned.startsWith('VAN')) {
      const suffix = cleaned.slice(3, 7)
      return suffix.length > 0 ? `VAN-${suffix}` : 'VAN-'
    }

    // Otherwise, add VAN- prefix if there's content
    if (cleaned.length > 0) {
      return `VAN-${cleaned.slice(0, 4)}`
    }

    return ''
  }

  const handleCodeChange = (text: string) => {
    setError(null)
    setCode(formatCode(text))
  }

  const handleSubmit = () => {
    if (code.length !== 8) {
      setError(t('invitation:errors.invalidCode'))
      return
    }

    useCodeMutation.mutate(code, {
      onSuccess: () => {
        setIsSuccess(true)
        // Wait a moment to show success state before navigating
        setTimeout(() => {
          onSuccess()
        }, 1500)
      },
      onError: (err: Error) => {
        switch (err.message) {
          case 'INVALID_CODE':
            setError(t('invitation:errors.invalidCode'))
            break
          case 'CODE_ALREADY_USED':
            setError(t('invitation:errors.codeUsed'))
            break
          case 'OWN_CODE':
            setError(t('invitation:errors.ownCode'))
            break
          default:
            setError(t('common:errors.generic'))
        }
      },
    })
  }

  const isValidFormat = code.length === 8 && code.startsWith('VAN-')

  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={64} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>{t('invitation:codeInput.successTitle')}</Text>
          <Text style={styles.successMessage}>{t('invitation:codeInput.successMessage')}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel={t('common:back')}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t('invitation:codeInput.title')}</Text>
          <Text style={styles.subtitle}>{t('invitation:codeInput.subtitle')}</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('invitation:codeInput.label')}</Text>
          <TextInput
            style={[styles.input, error ? styles.inputError : null]}
            value={code}
            onChangeText={handleCodeChange}
            placeholder={t('invitation:codeInput.placeholder')}
            placeholderTextColor={colors.text.muted}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={8}
            editable={!useCodeMutation.isPending}
          />
          {error ? (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}
          <Text style={styles.hint}>{t('invitation:codeInput.hint')}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValidFormat || useCodeMutation.isPending) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValidFormat || useCodeMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel={t('invitation:codeInput.submit')}
        >
          {useCodeMutation.isPending ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.submitButtonText}>{t('invitation:codeInput.submit')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.xxl,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    letterSpacing: 2,
    ...shadows.small,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: colors.error,
    flex: 1,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.secondary.main,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.muted,
  },
  submitButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIconContainer: {
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successMessage: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
})

export default InvitationCodeScreen
