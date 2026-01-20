import { useCallback, useEffect, useState } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useImagePicker } from './useImagePicker'
import { useUpdateProfile } from './useProfiles'

interface UseAvatarUploadOptions {
  userId: string | undefined
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseAvatarUploadResult {
  isUploading: boolean
  showModal: boolean
  openModal: () => void
  closeModal: () => void
  handlePickImage: () => void
  handleTakePhoto: () => void
}

export function useAvatarUpload({
  userId,
  onSuccess,
  onError,
}: UseAvatarUploadOptions): UseAvatarUploadResult {
  const { t } = useTranslation('common')
  const [showModal, setShowModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const {
    pickImage,
    takePhoto,
    uploadImage,
    imageUri,
    error: imageError,
    clearImage,
  } = useImagePicker()
  const { mutate: updateProfile } = useUpdateProfile()

  // Display image picker errors
  useEffect(() => {
    if (imageError) {
      Alert.alert(t('errors.generic'), imageError.message)
      onError?.(new Error(imageError.message))
    }
  }, [imageError, t, onError])

  // Upload avatar when image is selected
  useEffect(() => {
    if (!imageUri || !userId) {
      return
    }

    let isMounted = true

    const uploadAvatar = async () => {
      setIsUploading(true)
      try {
        const uploadedUrl = await uploadImage(userId)
        if (uploadedUrl && isMounted) {
          updateProfile(
            { avatar_url: uploadedUrl },
            {
              onSuccess: () => {
                onSuccess?.()
              },
              onError: (error: Error) => {
                Alert.alert(t('errors.generic'), error.message)
                onError?.(error)
              },
            }
          )
        }
        clearImage()
      } catch {
        // Error already handled by imageError effect
      } finally {
        if (isMounted) {
          setIsUploading(false)
        }
      }
    }

    uploadAvatar()

    return () => {
      isMounted = false
    }
  }, [imageUri, userId, uploadImage, updateProfile, clearImage, t, onSuccess, onError])

  const openModal = useCallback(() => {
    setShowModal(true)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
  }, [])

  const handlePickImage = useCallback(() => {
    setShowModal(false)
    // Wait for modal to fully close before launching picker (iOS timing issue)
    setTimeout(() => {
      pickImage()
    }, 500)
  }, [pickImage])

  const handleTakePhoto = useCallback(() => {
    setShowModal(false)
    // Wait for modal to fully close before launching camera (iOS timing issue)
    setTimeout(() => {
      takePhoto()
    }, 500)
  }, [takePhoto])

  return {
    isUploading,
    showModal,
    openModal,
    closeModal,
    handlePickImage,
    handleTakePhoto,
  }
}
