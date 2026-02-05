import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { TermsModal } from '../components/TermsModal'
import { LegalModal } from '../components/LegalModal'
import { useSignUp } from '../hooks'
import {
  sanitizeEmail,
  validatePasswordStrength,
  passwordsMatch,
  isValidEmail,
  containsSuspiciousCharacters,
} from '../utils/security/validation'
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme'

interface RegisterScreenProps {
  onNavigateToLogin: () => void
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { t } = useTranslation(['register', 'common'])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedLegal, setAcceptedLegal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showLegalModal, setShowLegalModal] = useState(false)
  const { mutateAsync: signUp, isPending: loading } = useSignUp()
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)
  const confirmPasswordRef = useRef<TextInput>(null)

  const handleRegister = async () => {
    // Vérification des champs requis
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common:errors.generic'), t('common:errors.fillAllFields'))
      return
    }

    // Vérification de l'acceptation des CGU et mentions légales
    if (!acceptedTerms) {
      Alert.alert(t('common:errors.generic'), t('errors.termsRequired'))
      return
    }

    if (!acceptedLegal) {
      Alert.alert(t('common:errors.generic'), t('errors.legalRequired'))
      return
    }

    // Nettoyage et validation de l'email
    const cleanEmail = sanitizeEmail(email)
    if (!isValidEmail(cleanEmail)) {
      Alert.alert(t('common:errors.generic'), t('errors.invalidEmail'))
      return
    }

    // Détection de caractères suspects
    if (containsSuspiciousCharacters(email) || containsSuspiciousCharacters(password)) {
      Alert.alert(t('common:errors.generic'), t('errors.suspiciousInput'))
      return
    }

    // Validation de la correspondance des mots de passe
    if (!passwordsMatch(password, confirmPassword)) {
      Alert.alert(t('common:errors.generic'), t('errors.passwordMismatch'))
      return
    }

    // Validation de la force du mot de passe
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      Alert.alert(t('errors.passwordRequirements'), passwordValidation.errors.join('\n'))
      return
    }

    try {
      await signUp({ email: cleanEmail, password })
      Alert.alert(t('success.title'), t('success.message'), [
        { text: 'OK', onPress: onNavigateToLogin },
      ])
    } catch (error: any) {
      Alert.alert(t('errors.title'), error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('title')}</Text>

          <Pressable onPress={() => emailRef.current?.focus()}>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={colors.text.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              editable={!loading}
            />
          </Pressable>

          <Pressable
            style={styles.passwordContainer}
            onPress={() => passwordRef.current?.focus()}
          >
            <TextInput
              ref={passwordRef}
              style={styles.passwordInput}
              placeholder={t('password')}
              placeholderTextColor={colors.text.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off' : 'eye'}
                size={24}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </Pressable>

          <Pressable
            style={styles.passwordContainer}
            onPress={() => confirmPasswordRef.current?.focus()}
          >
            <TextInput
              ref={confirmPasswordRef}
              style={styles.passwordInput}
              placeholder={t('confirmPassword')}
              placeholderTextColor={colors.text.muted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              textContentType="newPassword"
              autoComplete="password-new"
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons
                name={showConfirmPassword ? 'eye-off' : 'eye'}
                size={24}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          </Pressable>

          <Text style={styles.passwordRequirements}>{t('passwordRequirements')}</Text>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxTouchable}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Ionicons name="checkmark" size={18} color={colors.white} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              {t('termsPrefix')}{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                {t('termsLink')}
              </Text>
            </Text>
          </View>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxTouchable}
              onPress={() => setAcceptedLegal(!acceptedLegal)}
              disabled={loading}
            >
              <View style={[styles.checkbox, acceptedLegal && styles.checkboxChecked]}>
                {acceptedLegal && <Ionicons name="checkmark" size={18} color={colors.white} />}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              {t('legalPrefix')}{' '}
              <Text style={styles.termsLink} onPress={() => setShowLegalModal(true)}>
                {t('legalLink')}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t('submit')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNavigateToLogin}
            disabled={loading}
            style={styles.linkContainer}
          >
            <Text style={styles.linkText}>{t('hasAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setAcceptedTerms(true)}
      />

      <LegalModal
        visible={showLegalModal}
        onClose={() => setShowLegalModal(false)}
        onAccept={() => setAcceptedLegal(true)}
        showAcceptButton={true}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.huge,
    textAlign: 'center',
    color: colors.text.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.main,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    paddingRight: spacing.sm,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.text.primary,
  },
  eyeButton: {
    padding: spacing.xs,
  },
  passwordRequirements: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginBottom: spacing.lg,
    marginTop: -spacing.xs,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    marginTop: spacing.xs,
  },
  checkboxTouchable: {
    marginRight: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.secondary.main,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.secondary.main,
  },
  termsText: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.secondary.main,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    ...shadows.medium,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  linkContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  linkText: {
    color: colors.secondary.main,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
})
