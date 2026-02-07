import React, { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSignIn } from '../hooks'
import { useGoogleAuth } from '../hooks/useGoogleAuth'
import { sanitizeEmail, isValidEmail } from '../utils/security/validation'
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme'

interface LoginScreenProps {
  onNavigateToRegister: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { t } = useTranslation(['login', 'common'])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { mutateAsync: signIn, isPending: loading } = useSignIn()
  const { signInWithGoogle } = useGoogleAuth()
  const emailRef = useRef<TextInput>(null)
  const passwordRef = useRef<TextInput>(null)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common:errors.generic'), t('common:errors.fillAllFields'))
      return
    }

    // Nettoyage et validation de l'email
    const cleanEmail = sanitizeEmail(email)
    if (!isValidEmail(cleanEmail)) {
      Alert.alert(t('common:errors.generic'), t('errors.invalidEmail'))
      return
    }

    try {
      await signIn({ email: cleanEmail, password })
    } catch (error: any) {
      Alert.alert(t('errors.title'), error.message)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
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

        <Pressable style={styles.passwordContainer} onPress={() => passwordRef.current?.focus()}>
          <TextInput
            ref={passwordRef}
            style={styles.passwordInput}
            placeholder={t('password')}
            placeholderTextColor={colors.text.muted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            editable={!loading}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={24}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        </Pressable>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{t('submit')}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={async () => {
            try {
              await signInWithGoogle()
            } catch (error: any) {
              Alert.alert('Erreur de connexion', error.message || 'Impossible de se connecter avec Google')
            }
          }}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color={colors.text.primary} />
          <Text style={styles.googleButtonText}>Continuer avec Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNavigateToRegister}
          disabled={loading}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>{t('noAccount')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.main,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.muted,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.small,
  },
  googleButtonText: {
    color: colors.text.primary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
  },
})
