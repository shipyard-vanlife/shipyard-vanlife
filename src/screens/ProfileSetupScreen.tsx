import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ProfilePhotoInput } from '../components/ProfilePhotoInput'
import { useAuth } from '../contexts/AuthContext'
import { useSignOut } from '../hooks'
import { useImagePicker } from '../hooks/useImagePicker'
import { useLocation, LocationErrorCode } from '../hooks/useLocation'
import { useCompleteProfile, useMyProfile } from '../hooks/useProfiles'
import { ALL_SKILLS, SKILL_COLORS, SkillType } from '../types/user'
import { completeProfileSchema, getFieldErrors, parseSupabaseError } from '../utils/validation'
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme'

type ProfileFields = { username?: string; van_name?: string }

// Map location error codes to i18n keys
const locationErrorKeys: Record<LocationErrorCode, string> = {
  PERMISSION_DENIED: 'location.errors.permissionDenied',
  LOCATION_UNAVAILABLE: 'location.errors.unavailable',
  TIMEOUT: 'location.errors.timeout',
  UNKNOWN: 'location.errors.unknown',
}

export const ProfileSetupScreen: React.FC = () => {
  const { t } = useTranslation(['common', 'skills', 'profile', 'verification'])
  const { user } = useAuth()
  const { mutate: signOut } = useSignOut()
  const { data: profile } = useMyProfile()
  const { mutate: completeProfile, isPending } = useCompleteProfile()
  const {
    status: locationStatus,
    location,
    error: locationError,
    requestLocation,
    isLoading: isLocationLoading,
  } = useLocation()
  const {
    imageUri,
    isLoading: isImageLoading,
    error: imageError,
    pickImage,
    takePhoto,
    uploadImage,
  } = useImagePicker()

  const [username, setUsername] = useState('')
  const [vanName, setVanName] = useState('')
  const [skills, setSkills] = useState<SkillType[]>([])
  const [fieldErrors, setFieldErrors] = useState<ProfileFields>({})
  const [globalError, setGlobalError] = useState<string | null>(null)

  // Get firstname/lastname from verification data (read-only)
  const firstname = profile?.firstname ?? ''
  const lastname = profile?.lastname ?? ''

  const clearFieldError = (field: keyof ProfileFields) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const formValidation = completeProfileSchema.safeParse({
    username: username.trim(),
    van_name: vanName.trim(),
    skills,
  })

  // Form is valid if form fields are valid (location is optional)
  const isFormValid = formValidation.success

  const handleRequestLocation = async () => {
    setGlobalError(null)
    await requestLocation()
  }

  const performProfileCreation = async () => {
    // Upload avatar if selected
    let avatarUrl: string | null = null
    if (imageUri && user) {
      avatarUrl = await uploadImage(user.id)
    }

    const result = completeProfileSchema.safeParse({
      username: username.trim(),
      van_name: vanName.trim(),
      skills,
    })

    if (!result.success) return

    completeProfile(
      {
        username: result.data.username,
        van_name: result.data.van_name,
        avatar_url: avatarUrl,
        skills: result.data.skills,
        latitude: location?.latitude,
        longitude: location?.longitude,
        city: location?.city ?? undefined,
        country: location?.country ?? undefined,
        tripName: t('trip.defaultName'),
      },
      {
        onError: (err: Error) => setGlobalError(parseSupabaseError(err)),
      }
    )
  }

  const handleSubmit = async () => {
    setFieldErrors({})
    setGlobalError(null)

    const result = completeProfileSchema.safeParse({
      username: username.trim(),
      van_name: vanName.trim(),
      skills,
    })

    if (!result.success) {
      setFieldErrors(getFieldErrors<ProfileFields>(result.error))
      return
    }

    // If no location, show confirmation alert
    const hasLocation = location !== null
    if (!hasLocation) {
      Alert.alert(
        t('location.noLocationWarning.title'),
        t('location.noLocationWarning.message') + '\n\n' + t('location.noLocationWarning.note'),
        [
          {
            text: t('location.noLocationWarning.retryButton'),
            style: 'cancel',
            onPress: handleRequestLocation,
          },
          {
            text: t('location.noLocationWarning.continueButton'),
            onPress: performProfileCreation,
          },
        ]
      )
      return
    }

    // If location is available, proceed directly
    await performProfileCreation()
  }

  // Get location error message
  const locationErrorMessage = locationError ? locationErrorKeys[locationError.code] : null
  const hasLocation = locationStatus === 'granted' && location !== null

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text style={styles.title}>{t('profile.setupTitle')}</Text>
          <Text style={styles.subtitle}>{t('profile.setupSubtitle')}</Text>

          {globalError ? <Text style={styles.errorBanner}>{t(globalError)}</Text> : null}

          {/* Profile Photo */}
          <ProfilePhotoInput
            imageUri={imageUri}
            isLoading={isImageLoading}
            error={imageError}
            onPickImage={pickImage}
            onTakePhoto={takePhoto}
            disabled={isPending}
          />

          {/* Verified Identity (Read-only) */}
          {firstname || lastname ? (
            <View style={styles.verifiedSection}>
              <View style={styles.verifiedHeader}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.verifiedLabel}>{t('verification:steps.identity')}</Text>
              </View>
              <View style={styles.verifiedRow}>
                <View style={styles.verifiedField}>
                  <Text style={styles.verifiedFieldLabel}>{t('verification:form.firstname')}</Text>
                  <Text style={styles.verifiedFieldValue}>{firstname}</Text>
                </View>
                <View style={styles.verifiedField}>
                  <Text style={styles.verifiedFieldLabel}>{t('verification:form.lastname')}</Text>
                  <Text style={styles.verifiedFieldValue}>{lastname}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Username Input */}
          <Text style={styles.label}>{t('profile.usernameLabel')}</Text>
          <TextInput
            style={[styles.input, fieldErrors.username && styles.inputError]}
            placeholder={t('profile.usernamePlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={username}
            onChangeText={text => {
              setUsername(text)
              clearFieldError('username')
            }}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="nickname"
            autoComplete="username"
            maxLength={30}
            editable={!isPending}
          />
          {fieldErrors.username ? (
            <Text style={styles.fieldError}>{t(fieldErrors.username)}</Text>
          ) : null}

          {/* Van Name Input */}
          <Text style={styles.label}>{t('profile.vanNameLabel')}</Text>
          <TextInput
            style={[styles.input, fieldErrors.van_name && styles.inputError]}
            placeholder={t('profile.vanNamePlaceholder')}
            placeholderTextColor={colors.text.muted}
            value={vanName}
            onChangeText={text => {
              setVanName(text)
              clearFieldError('van_name')
            }}
            autoCapitalize="words"
            autoCorrect={false}
            textContentType="none"
            autoComplete="off"
            maxLength={50}
            editable={!isPending}
          />
          {fieldErrors.van_name ? (
            <Text style={styles.fieldError}>{t(fieldErrors.van_name)}</Text>
          ) : null}

          {/* Skills Selection (max 3) */}
          <View style={styles.skillsHeader}>
            <Text style={styles.label}>
              {t('profile.skillsLabel', { defaultValue: 'Compétences (max 3)' })}
            </Text>
            <Text style={styles.skillCounter}>{skills.length}/3</Text>
          </View>
          <View style={styles.skillsGrid}>
            {ALL_SKILLS.map(skill => {
              const isSelected = skills.includes(skill)
              const canSelect = skills.length < 3 || isSelected
              return (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillButton,
                    {
                      backgroundColor: isSelected ? SKILL_COLORS[skill] : colors.primary.dark,
                      opacity: !canSelect ? 0.4 : 1,
                    },
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSkills(skills.filter(s => s !== skill))
                    } else if (skills.length < 3) {
                      setSkills([...skills, skill])
                    }
                  }}
                  disabled={isPending || (!canSelect && !isSelected)}
                >
                  <Text
                    style={[
                      styles.skillButtonText,
                      { color: isSelected ? colors.white : colors.text.secondary },
                    ]}
                  >
                    {t(`skills:${skill}`)}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Location Section (Optional) */}
          <View style={styles.locationHeader}>
            <Text style={styles.label}>{t('location.title')}</Text>
            <Text style={styles.optionalBadge}>{t('photo.optional')}</Text>
          </View>
          <TouchableOpacity
            style={[styles.locationButton, hasLocation && styles.locationButtonSuccess]}
            onPress={handleRequestLocation}
            disabled={isPending || isLocationLoading}
          >
            {isLocationLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons
                  name={hasLocation ? 'checkmark-circle' : 'location'}
                  size={20}
                  color={colors.white}
                />
                <Text style={styles.locationButtonText}>
                  {hasLocation ? location.city : t('location.requestButton')}
                </Text>
              </>
            )}
          </TouchableOpacity>
          {locationErrorMessage ? (
            <Text style={styles.fieldError}>{t(locationErrorMessage)}</Text>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, (!isFormValid || isPending) && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isPending}
          >
            {isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>{t('buttons.completeProfile')}</Text>
            )}
          </TouchableOpacity>

          {/* Sign out link */}
          <TouchableOpacity style={styles.signOutLink} onPress={() => signOut()} disabled={isPending}>
            <Text style={styles.signOutLinkText}>{t('profile:actions.signOut')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    paddingTop: 60,
  },
  title: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.text.tertiary,
    marginBottom: spacing.xxxl,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    color: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  fieldError: {
    color: colors.error,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  skillCounter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.secondary.main,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  skillButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
  },
  skillButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  optionalBadge: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    fontStyle: 'italic',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary.main,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  locationButtonSuccess: {
    backgroundColor: colors.success,
  },
  locationButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  button: {
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.huge,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  signOutLink: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
  },
  signOutLinkText: {
    color: colors.text.tertiary,
    fontSize: fontSize.base,
    textDecorationLine: 'underline',
  },
  verifiedSection: {
    backgroundColor: colors.primary.light,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  verifiedLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  verifiedRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  verifiedField: {
    flex: 1,
  },
  verifiedFieldLabel: {
    fontSize: fontSize.xs,
    color: colors.text.muted,
    marginBottom: spacing.xs,
  },
  verifiedFieldValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
})
