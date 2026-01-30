import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useSignIn } from '../hooks'
import { sanitizeEmail, isValidEmail } from '../utils/security/validation'
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  shadows,
} from '../styles/theme'

interface LoginScreenProps {
  onNavigateToRegister: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { t } = useTranslation(['login', 'common'])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { mutateAsync: signIn, isPending: loading } = useSignIn()

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

        <TextInput
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

        <View style={styles.passwordContainer}>
          <TextInput
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
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

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
})
