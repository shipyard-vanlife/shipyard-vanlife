import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { TermsModal } from '../components/TermsModal'
import {
  sanitizeInput,
  sanitizeEmail,
  validatePasswordStrength,
  passwordsMatch,
  isValidEmail,
  containsSuspiciousCharacters,
} from '../utils/security/validation'

interface RegisterScreenProps {
  onNavigateToLogin: () => void
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { t } = useTranslation(['register', 'common'])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const { signUp } = useAuth()

  const handleRegister = async () => {
    // Vérification des champs requis
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('common:errors.generic'), t('common:errors.fillAllFields'))
      return
    }

    // Vérification de l'acceptation des mentions légales
    if (!acceptedTerms) {
      Alert.alert(t('common:errors.generic'), t('errors.termsRequired'))
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

    setLoading(true)
    try {
      await signUp(cleanEmail, password)
      Alert.alert(t('success.title'), t('success.message'), [
        { text: 'OK', onPress: onNavigateToLogin },
      ])
    } catch (error: any) {
      Alert.alert(t('errors.title'), error.message)
    } finally {
      setLoading(false)
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

          <TextInput
            style={styles.input}
            placeholder={t('email')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('confirmPassword')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.passwordRequirements}>{t('passwordRequirements')}</Text>

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxTouchable}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              disabled={loading}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Ionicons name="checkmark" size={18} color="#fff" />}
              </View>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              {t('termsPrefix')}{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                {t('termsLink')}
              </Text>
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
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
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1E8',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#2C2C2C',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D4C5B9',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#2C2C2C',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4C5B9',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#2C2C2C',
  },
  eyeButton: {
    padding: 5,
  },
  passwordRequirements: {
    fontSize: 12,
    color: '#8B7355',
    marginBottom: 15,
    marginTop: -5,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 5,
  },
  checkboxTouchable: {
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#E07A5F',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#E07A5F',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 20,
  },
  termsLink: {
    color: '#E07A5F',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  button: {
    backgroundColor: '#E07A5F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#E07A5F',
    fontSize: 14,
    fontWeight: '500',
  },
})
