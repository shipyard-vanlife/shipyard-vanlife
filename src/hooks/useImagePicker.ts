import { useState, useCallback } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../services/supabase'

export type ImagePickerErrorCode = 'PERMISSION_DENIED' | 'UPLOAD_FAILED' | 'UNKNOWN'

export interface ImagePickerError {
  code: ImagePickerErrorCode
  message: string
}

export interface UseImagePickerResult {
  imageUri: string | null
  uploadedUrl: string | null
  isLoading: boolean
  error: ImagePickerError | null
  pickImage: () => Promise<void>
  takePhoto: () => Promise<void>
  uploadImage: (userId: string) => Promise<string | null>
  clearImage: () => void
}

export function useImagePicker(): UseImagePickerResult {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ImagePickerError | null>(null)

  const pickImage = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Media library permission denied' })
        return
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      // Annulation = ne rien faire (pas une erreur)
      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
        setUploadedUrl(null)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const takePhoto = useCallback(async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Request camera permission explicitly
      const { granted } = await ImagePicker.requestCameraPermissionsAsync()
      if (!granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Camera permission denied' })
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      // Annulation = ne rien faire (pas une erreur)
      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
        setUploadedUrl(null)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadImage = useCallback(
    async (userId: string): Promise<string | null> => {
      if (!imageUri) return null

      setError(null)
      setIsLoading(true)

      try {
        // Get file extension from URI
        const ext = imageUri.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${userId}/avatar.${ext}`

        // Fetch the image as blob
        const response = await fetch(imageUri)
        const blob = await response.blob()

        // Convert blob to array buffer for Supabase
        const arrayBuffer = await blob.arrayBuffer()

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, arrayBuffer, {
            contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
            upsert: true,
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from('avatars').getPublicUrl(fileName)

        // Add cache buster to URL
        const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`
        setUploadedUrl(urlWithCacheBuster)

        return urlWithCacheBuster
      } catch (err) {
        setError({
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to upload image',
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [imageUri]
  )

  const clearImage = useCallback(() => {
    setImageUri(null)
    setUploadedUrl(null)
    setError(null)
  }, [])

  return {
    imageUri,
    uploadedUrl,
    isLoading,
    error,
    pickImage,
    takePhoto,
    uploadImage,
    clearImage,
  }
}
