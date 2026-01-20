import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { supabase } from '../services/supabase'
import { useUpdateProfile } from './useProfiles'
import { useAuth } from '../contexts/AuthContext'

const MAX_PHOTOS = 5
const BUCKET_NAME = 'profile-photos'

export interface UseProfilePhotosUploadReturn {
  uploadPhoto: (imageUri: string, currentPhotos: string[]) => Promise<void>
  deletePhoto: (photoUrl: string, currentPhotos: string[]) => Promise<void>
  isUploading: boolean
  isDeleting: boolean
  canAddPhoto: (currentCount: number) => boolean
}

function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Hook for uploading/deleting profile photos.
 * Does NOT include image picker - expects imageUri to be provided.
 * This avoids conflicts with multiple image picker instances.
 */
export function useProfilePhotosUpload(): UseProfilePhotosUploadReturn {
  const { t } = useTranslation('profile')
  const { user } = useAuth()
  const { mutateAsync: updateProfile } = useUpdateProfile()
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const canAddPhoto = useCallback((currentCount: number): boolean => {
    return currentCount < MAX_PHOTOS
  }, [])

  const uploadPhoto = useCallback(
    async (imageUri: string, currentPhotos: string[]) => {
      if (!user) {
        Alert.alert(t('common:errors.generic'), t('photos.uploadFailed'))
        return
      }

      if (!canAddPhoto(currentPhotos.length)) {
        Alert.alert(t('common:errors.generic'), t('photos.maxReached'))
        return
      }

      setIsUploading(true)
      try {
        const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
        const uniqueId = generateUniqueId()
        const fileName = `${user.id}/${uniqueId}.${ext}`

        // Fetch the image as blob
        const response = await fetch(imageUri)
        const blob = await response.blob()

        // Convert blob to base64 using FileReader (React Native compatible)
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              const base64Data = reader.result.split(',')[1]
              resolve(base64Data)
            } else {
              reject(new Error('Failed to read file as base64'))
            }
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })

        // Decode base64 to Uint8Array for Supabase
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, bytes, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            upsert: false,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

        // Update profile with new photo
        const newPhotos = [...currentPhotos, publicUrl]
        await updateProfile({ photos: newPhotos })
      } catch {
        Alert.alert(t('common:errors.generic'), t('photos.uploadFailed'))
      } finally {
        setIsUploading(false)
      }
    },
    [user, canAddPhoto, updateProfile, t]
  )

  const deletePhoto = useCallback(
    async (photoUrl: string, currentPhotos: string[]) => {
      if (!user) {
        Alert.alert(t('common:errors.generic'), t('photos.deleteFailed'))
        return
      }

      setIsDeleting(true)

      try {
        // Extract file path from URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/profile-photos/{userId}/{filename}
        const urlParts = photoUrl.split(`${BUCKET_NAME}/`)
        if (urlParts.length >= 2) {
          const filePath = urlParts[1].split('?')[0] // Remove query params if any

          // Delete from storage (ignore errors - file might already be deleted)
          await supabase.storage.from(BUCKET_NAME).remove([filePath])
        }

        // Update profile without the deleted photo
        const newPhotos = currentPhotos.filter((p) => p !== photoUrl)
        await updateProfile({ photos: newPhotos })
      } catch {
        Alert.alert(t('common:errors.generic'), t('photos.deleteFailed'))
      } finally {
        setIsDeleting(false)
      }
    },
    [user, updateProfile, t]
  )

  return {
    uploadPhoto,
    deletePhoto,
    isUploading,
    isDeleting,
    canAddPhoto,
  }
}
