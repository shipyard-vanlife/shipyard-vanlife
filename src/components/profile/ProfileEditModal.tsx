import React, { useState, useCallback, useEffect } from 'react'
import {
  Modal,
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { SkillType } from '../../types/user'
import { useAuth } from '../../contexts/AuthContext'
import { useUpdateProfile } from '../../hooks/useProfiles'
import { useVanPhotoUpload } from '../../hooks/useVanPhotoUpload'
import { updateProfileSchema, getFieldErrors } from '../../utils/validation'
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme'
import { PhotoSourceModal } from '../PhotoSourceModal'
import {
  ProfileEditHeader,
  ProfileEditTextField,
  ProfileEditSkillSelector,
  ProfileEditVisibilityToggle,
  ProfileEditVanPhotoInput,
} from './edit'

interface ProfileEditModalProps {
  visible: boolean
  onClose: () => void
  initialData: {
    van_name: string | null
    van_photo_url: string | null
    bio: string | null
    main_specialty: SkillType | null
    is_visible: boolean
  }
}

type FieldErrors = {
  van_name?: string
  bio?: string
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ visible, onClose, initialData }) => {
  const { t } = useTranslation(['profile', 'common'])
  const { user } = useAuth()
  const { mutateAsync: updateProfile, isPending: isSaving } = useUpdateProfile()

  // Van photo upload hook
  const {
    imageUri: vanPhotoUri,
    isLoading: isVanPhotoLoading,
    pickImage: pickVanPhoto,
    takePhoto: takeVanPhoto,
    uploadVanPhoto,
    setImageFromUrl,
    clearImage: clearVanPhoto,
  } = useVanPhotoUpload()

  // Form state
  const [vanName, setVanName] = useState(initialData.van_name ?? '')
  const [bio, setBio] = useState(initialData.bio ?? '')
  const [mainSpecialty, setMainSpecialty] = useState<SkillType | null>(initialData.main_specialty)
  const [isVisible, setIsVisible] = useState(initialData.is_visible)

  // UI state
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [showPhotoModal, setShowPhotoModal] = useState(false)

  // Initialize van photo from existing URL when modal opens
  useEffect(() => {
    if (visible) {
      setVanName(initialData.van_name ?? '')
      setBio(initialData.bio ?? '')
      setMainSpecialty(initialData.main_specialty)
      setIsVisible(initialData.is_visible)
      setImageFromUrl(initialData.van_photo_url)
      setFieldErrors({})
    }
  }, [visible, initialData, setImageFromUrl])

  // Clean up when modal closes
  useEffect(() => {
    if (!visible) {
      clearVanPhoto()
    }
  }, [visible, clearVanPhoto])

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleVanPhotoPress = useCallback(() => {
    setShowPhotoModal(true)
  }, [])

  const handleClosePhotoModal = useCallback(() => {
    setShowPhotoModal(false)
  }, [])

  const handlePickImage = useCallback(() => {
    setShowPhotoModal(false)
    setTimeout(() => {
      pickVanPhoto()
    }, 600)
  }, [pickVanPhoto])

  const handleTakePhoto = useCallback(() => {
    setShowPhotoModal(false)
    setTimeout(() => {
      takeVanPhoto()
    }, 600)
  }, [takeVanPhoto])

  const handleSave = useCallback(async () => {
    if (!user) return

    setFieldErrors({})

    // Validate form
    const result = updateProfileSchema.safeParse({
      van_name: vanName.trim(),
      bio: bio.trim(),
      main_specialty: mainSpecialty,
      is_visible: isVisible,
    })

    if (!result.success) {
      const errors = getFieldErrors<FieldErrors>(result.error)
      setFieldErrors(errors)
      return
    }

    try {
      // Upload van photo if it's a local file (not a URL)
      let vanPhotoUrl = vanPhotoUri
      if (vanPhotoUri && !vanPhotoUri.startsWith('http')) {
        const uploadedUrl = await uploadVanPhoto(user.id)
        if (!uploadedUrl) {
          Alert.alert(t('common:errors.generic'), t('common:photo.errors.uploadFailed'))
          return
        }
        vanPhotoUrl = uploadedUrl
      }

      // Update profile
      await updateProfile({
        van_name: result.data.van_name,
        van_photo_url: vanPhotoUrl,
        bio: result.data.bio,
        main_specialty: result.data.main_specialty,
        is_visible: result.data.is_visible,
      })

      onClose()
    } catch {
      Alert.alert(t('common:errors.generic'), t('edit.error'))
    }
  }, [
    user,
    vanName,
    bio,
    mainSpecialty,
    isVisible,
    vanPhotoUri,
    uploadVanPhoto,
    updateProfile,
    onClose,
    t,
  ])

  const isProcessing = isSaving || isVanPhotoLoading

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ProfileEditHeader title={t('edit.title')} onClose={onClose} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Van Photo */}
            <ProfileEditVanPhotoInput
              label={t('edit.vanPhotoLabel')}
              hint={t('edit.vanPhotoHint')}
              photoUrl={vanPhotoUri}
              onPress={handleVanPhotoPress}
              isLoading={isVanPhotoLoading}
              disabled={isProcessing}
            />

            {/* Van Name */}
            <ProfileEditTextField
              label={t('edit.vanNameLabel')}
              value={vanName}
              onChangeText={(text) => {
                setVanName(text)
                clearFieldError('van_name')
              }}
              placeholder={t('edit.vanNamePlaceholder')}
              error={fieldErrors.van_name ? t(`common:${fieldErrors.van_name}`) : undefined}
              maxLength={50}
              disabled={isProcessing}
              autoCapitalize="words"
            />

            {/* Bio */}
            <ProfileEditTextField
              label={t('edit.bioLabel')}
              value={bio}
              onChangeText={(text) => {
                setBio(text)
                clearFieldError('bio')
              }}
              placeholder={t('edit.bioPlaceholder')}
              error={fieldErrors.bio ? t(`common:${fieldErrors.bio}`) : undefined}
              multiline
              maxLength={500}
              disabled={isProcessing}
              charCount={bio.length}
              charMax={500}
            />

            {/* Main Specialty */}
            <ProfileEditSkillSelector
              label={t('edit.mainSpecialtyLabel')}
              hint={t('edit.mainSpecialtyHint')}
              selectedSkill={mainSpecialty}
              onSelectSkill={setMainSpecialty}
              disabled={isProcessing}
            />

            {/* Visibility Toggle */}
            <ProfileEditVisibilityToggle
              label={t('edit.visibilityLabel')}
              description={t('edit.visibilityDescription')}
              value={isVisible}
              onValueChange={setIsVisible}
              disabled={isProcessing}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isProcessing && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              {isProcessing ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>{t('edit.saveButton')}</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Photo Source Modal */}
        <PhotoSourceModal
          visible={showPhotoModal}
          onClose={handleClosePhotoModal}
          onTakePhoto={handleTakePhoto}
          onPickImage={handlePickImage}
        />
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.card,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.huge,
  },
  saveButton: {
    backgroundColor: colors.secondary.main,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
})
