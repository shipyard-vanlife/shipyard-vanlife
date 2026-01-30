import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQueryClient } from '@tanstack/react-query'
import {
  VerificationStepIndicator,
  VerificationIdentityForm,
  VerificationPhotosForm,
  VerificationConfirmation,
} from '../components/verification'
import { useSignOut } from '../hooks'
import { useSubmitVerification } from '../hooks/useVerification'
import { profileKeys } from '../hooks/useProfiles'
import {
  firstnameSchema,
  lastnameSchema,
  dateOfBirthSchema,
  photoUriSchema,
  verificationSchema,
  getFirstZodError,
} from '../utils/validation'
import { colors, fontSize, fontWeight, spacing, borderRadius } from '../styles/theme'

type Step = 1 | 2 | 3
const TOTAL_STEPS = 3
const ERROR_AUTO_DISMISS_MS = 5000

interface FormErrors {
  firstname?: string
  lastname?: string
  dateOfBirth?: string
  facePhoto?: string
  vanWithPersonPhoto?: string
  registrationPlatePhoto?: string
}

export const VerificationScreen: React.FC = () => {
  const { t } = useTranslation(['verification', 'common', 'profile'])
  const { mutate: signOut } = useSignOut()
  const queryClient = useQueryClient()
  const { mutate: submitVerification, isPending } = useSubmitVerification()

  // Form state
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null)
  const [facePhotoUri, setFacePhotoUri] = useState<string | null>(null)
  const [vanWithPersonPhotoUri, setVanWithPersonPhotoUri] = useState<string | null>(null)
  const [registrationPlatePhotoUri, setRegistrationPlatePhotoUri] = useState<string | null>(null)
  const [errors, setErrors] = useState<FormErrors>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Memoize step names to avoid unnecessary re-renders
  const stepNames = useMemo(
    () => [
      t('verification:steps.identity'),
      t('verification:steps.photos'),
      t('verification:steps.confirm'),
    ],
    [t]
  )

  // Auto-dismiss error after timeout
  useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => {
        setGlobalError(null)
      }, ERROR_AUTO_DISMISS_MS)
      return () => clearTimeout(timer)
    }
  }, [globalError])

  const clearError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined }
      }
      return prev
    })
  }, [])

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {}

    const firstnameResult = firstnameSchema.safeParse(firstname.trim())
    if (!firstnameResult.success) {
      newErrors.firstname = getFirstZodError(firstnameResult.error)
    }

    const lastnameResult = lastnameSchema.safeParse(lastname.trim())
    if (!lastnameResult.success) {
      newErrors.lastname = getFirstZodError(lastnameResult.error)
    }

    const dateOfBirthResult = dateOfBirthSchema.safeParse(dateOfBirth)
    if (!dateOfBirthResult.success) {
      newErrors.dateOfBirth = getFirstZodError(dateOfBirthResult.error)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {}

    const facePhotoResult = photoUriSchema.safeParse(facePhotoUri)
    if (!facePhotoResult.success) {
      newErrors.facePhoto = getFirstZodError(facePhotoResult.error)
    }

    const vanPhotoResult = photoUriSchema.safeParse(vanWithPersonPhotoUri)
    if (!vanPhotoResult.success) {
      newErrors.vanWithPersonPhoto = getFirstZodError(vanPhotoResult.error)
    }

    const platePhotoResult = photoUriSchema.safeParse(registrationPlatePhotoUri)
    if (!platePhotoResult.success) {
      newErrors.registrationPlatePhoto = getFirstZodError(platePhotoResult.error)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    setGlobalError(null)

    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = () => {
    setGlobalError(null)

    // Final validation
    const result = verificationSchema.safeParse({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      dateOfBirth,
      facePhotoUri,
      vanWithPersonPhotoUri,
      registrationPlatePhotoUri,
    })

    if (!result.success) {
      setGlobalError('errors.submitFailed')
      return
    }

    submitVerification(
      {
        firstname: result.data.firstname,
        lastname: result.data.lastname,
        dateOfBirth: result.data.dateOfBirth,
        facePhotoUri: result.data.facePhotoUri,
        vanWithPersonPhotoUri: result.data.vanWithPersonPhotoUri,
        registrationPlatePhotoUri: result.data.registrationPlatePhotoUri,
      },
      {
        onSuccess: () => {
          // Show success screen instead of navigating immediately
          setIsSubmitted(true)
        },
        onError: (error: Error) => {
          Alert.alert(t('verification:errors.submitFailed'), error.message)
        },
      }
    )
  }

  const handleContinueToProfile = () => {
    // Invalidate profile query to trigger navigation to ProfileSetupScreen
    queryClient.invalidateQueries({ queryKey: profileKeys.my() })
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <VerificationIdentityForm
            firstname={firstname}
            lastname={lastname}
            dateOfBirth={dateOfBirth}
            onFirstnameChange={value => {
              setFirstname(value)
              clearError('firstname')
            }}
            onLastnameChange={value => {
              setLastname(value)
              clearError('lastname')
            }}
            onDateOfBirthChange={value => {
              setDateOfBirth(value)
              clearError('dateOfBirth')
            }}
            errors={errors}
            disabled={isPending}
          />
        )
      case 2:
        return (
          <VerificationPhotosForm
            facePhotoUri={facePhotoUri}
            vanWithPersonPhotoUri={vanWithPersonPhotoUri}
            registrationPlatePhotoUri={registrationPlatePhotoUri}
            onFacePhotoChange={uri => {
              setFacePhotoUri(uri)
              clearError('facePhoto')
            }}
            onVanWithPersonPhotoChange={uri => {
              setVanWithPersonPhotoUri(uri)
              clearError('vanWithPersonPhoto')
            }}
            onRegistrationPlatePhotoChange={uri => {
              setRegistrationPlatePhotoUri(uri)
              clearError('registrationPlatePhoto')
            }}
            errors={errors}
            disabled={isPending}
          />
        )
      case 3:
        return (
          <VerificationConfirmation
            firstname={firstname}
            lastname={lastname}
            dateOfBirth={dateOfBirth}
            facePhotoUri={facePhotoUri}
            vanWithPersonPhotoUri={vanWithPersonPhotoUri}
            registrationPlatePhotoUri={registrationPlatePhotoUri}
          />
        )
      default:
        return null
    }
  }

  // Success screen after submission
  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.successContainer}>
          {/* Success icon */}
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>✓</Text>
          </View>

          {/* Title & subtitle */}
          <Text style={styles.successTitle}>{t('verification:submitted.title')}</Text>
          <Text style={styles.successSubtitle}>{t('verification:submitted.subtitle')}</Text>

          {/* Message */}
          <View style={styles.successCard}>
            <Text style={styles.successMessage}>{t('verification:submitted.message')}</Text>
          </View>

          {/* Note */}
          <Text style={styles.successNote}>{t('verification:submitted.note')}</Text>

          {/* Continue button */}
          <TouchableOpacity
            style={styles.successButton}
            onPress={handleContinueToProfile}
            accessibilityRole="button"
            accessibilityLabel={t('verification:submitted.continue')}
          >
            <Text style={styles.successButtonText}>{t('verification:submitted.continue')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <Text style={styles.title}>{t('verification:title')}</Text>
          <Text style={styles.subtitle}>{t('verification:subtitle')}</Text>

          {/* Step Indicator */}
          <VerificationStepIndicator
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            stepNames={stepNames}
          />

          {/* Global Error */}
          {globalError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{t(`verification:${globalError}`)}</Text>
            </View>
          ) : null}

          {/* Step Content */}
          {renderStep()}
        </View>

        {/* Navigation Buttons - inside ScrollView so they don't float above keyboard */}
        <View style={styles.buttonsContainer}>
          <View style={styles.buttonsRow}>
            {currentStep > 1 ? (
              <TouchableOpacity
                style={[styles.secondaryButton, isPending && styles.secondaryButtonDisabled]}
                onPress={handlePrevious}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel={t('verification:buttons.previous')}
                accessibilityState={{ disabled: isPending }}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isPending && styles.secondaryButtonTextDisabled,
                  ]}
                >
                  {t('verification:buttons.previous')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.buttonSpacer} />
            )}

            {currentStep < TOTAL_STEPS ? (
              <TouchableOpacity
                style={[styles.primaryButton, isPending && styles.primaryButtonDisabled]}
                onPress={handleNext}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel={t('verification:buttons.next')}
                accessibilityState={{ disabled: isPending }}
              >
                <Text style={styles.primaryButtonText}>{t('verification:buttons.next')}</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, isPending && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityLabel={t('verification:buttons.submit')}
                accessibilityState={{ disabled: isPending, busy: isPending }}
              >
                {isPending ? (
                  <View style={styles.loadingButtonContent}>
                    <ActivityIndicator color={colors.white} size="small" />
                    <Text style={styles.primaryButtonText}>
                      {t('verification:buttons.submitting')}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>{t('verification:buttons.submit')}</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Sign out link */}
          <TouchableOpacity
            style={styles.signOutLink}
            onPress={() => signOut()}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={t('profile:actions.signOut')}
            accessibilityHint={t('verification:accessibility.signOutHint')}
          >
            <Text style={[styles.signOutLinkText, isPending && styles.signOutLinkTextDisabled]}>
              {t('profile:actions.signOut')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.text.tertiary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  // Error banner with animation
  errorBanner: {
    backgroundColor: '#FEE2E2',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorBannerText: {
    color: colors.error,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
  },
  // Buttons container - now inside scroll content
  buttonsContainer: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  buttonSpacer: {
    flex: 1,
  },
  // Primary button
  primaryButton: {
    flex: 1,
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.secondary.light,
    opacity: 0.7,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  // Secondary button
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.main,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonDisabled: {
    borderColor: colors.border.light,
    opacity: 0.6,
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  secondaryButtonTextDisabled: {
    color: colors.text.disabled,
  },
  // Sign out link
  signOutLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  signOutLinkText: {
    color: colors.text.tertiary,
    fontSize: fontSize.base,
    textDecorationLine: 'underline',
  },
  signOutLinkTextDisabled: {
    color: colors.text.disabled,
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    fontSize: 40,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  successTitle: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    fontSize: fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successCard: {
    backgroundColor: colors.background.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  successMessage: {
    fontSize: fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  successNote: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    lineHeight: 20,
  },
  successButton: {
    backgroundColor: colors.secondary.main,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.md,
    minWidth: 200,
  },
  successButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
})
