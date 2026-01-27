import { useState, useCallback, useRef } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { supabase } from '../services/supabase'
import { compressImageWithPreset } from '../utils/imageCompression'

export type VanPhotoErrorCode = 'PERMISSION_DENIED' | 'UPLOAD_FAILED' | 'UNKNOWN'

export interface VanPhotoError {
  code: VanPhotoErrorCode
  message: string
}

export interface UseVanPhotoUploadReturn {
  imageUri: string | null
  isLoading: boolean
  error: VanPhotoError | null
  pickImage: () => Promise<void>
  takePhoto: () => Promise<void>
  uploadVanPhoto: (userId: string) => Promise<string | null>
  clearImage: () => void
  setImageFromUrl: (url: string | null) => void
}

const BUCKET_NAME = 'van-photos'

/**
 * Hook for uploading van photo.
 * Similar to useImagePicker but dedicated to van photos.
 * Uploads to van-photos bucket with filename: {userId}/van.{ext}
 */
export function useVanPhotoUpload(): UseVanPhotoUploadReturn {
  const [imageUri, setImageUri] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<VanPhotoError | null>(null)

  const isPickingRef = useRef(false)

  const pickImage = useCallback(async () => {
    if (isPickingRef.current) return

    isPickingRef.current = true
    setError(null)
    setIsLoading(true)

    const safetyTimeout = setTimeout(() => {
      if (isPickingRef.current) {
        isPickingRef.current = false
        setIsLoading(false)
      }
    }, 60000)

    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

      if (!permissionResult.granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Media library permission denied' })
        return
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9], // Van photos are typically landscape
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      clearTimeout(safetyTimeout)
      isPickingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const takePhoto = useCallback(async () => {
    if (isPickingRef.current) return

    isPickingRef.current = true
    setError(null)
    setIsLoading(true)

    const safetyTimeout = setTimeout(() => {
      if (isPickingRef.current) {
        isPickingRef.current = false
        setIsLoading(false)
      }
    }, 60000)

    try {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync()

      if (!granted) {
        setError({ code: 'PERMISSION_DENIED', message: 'Camera permission denied' })
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9], // Van photos are typically landscape
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]?.uri) {
        setImageUri(result.assets[0].uri)
      }
    } catch (err) {
      setError({
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      clearTimeout(safetyTimeout)
      isPickingRef.current = false
      setIsLoading(false)
    }
  }, [])

  const uploadVanPhoto = useCallback(
    async (userId: string): Promise<string | null> => {
      if (!imageUri) {
        return null
      }

      // If it's already a URL (not a local file), just return it
      if (imageUri.startsWith('http')) {
        return imageUri
      }

      setError(null)
      setIsLoading(true)

      try {
        // Compress image before upload (target ~150 KB for van photos)
        const compressed = await compressImageWithPreset(imageUri, 'vanPhoto')

        // Always use jpg for compressed images
        const fileName = `${userId}/van.jpg`

        // Fetch the compressed image as blob
        const response = await fetch(compressed.uri)
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
            contentType: 'image/jpeg',
            upsert: true, // Replace existing van photo
          })

        if (uploadError) {
          throw uploadError
        }

        // Get public URL with cache buster
        const {
          data: { publicUrl },
        } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName)

        const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`

        return urlWithCacheBuster
      } catch (err) {
        setError({
          code: 'UPLOAD_FAILED',
          message: err instanceof Error ? err.message : 'Failed to upload van photo',
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
    setError(null)
  }, [])

  // Allow setting image from existing URL (for edit mode)
  const setImageFromUrl = useCallback((url: string | null) => {
    setImageUri(url)
    setError(null)
  }, [])

  return {
    imageUri,
    isLoading,
    error,
    pickImage,
    takePhoto,
    uploadVanPhoto,
    clearImage,
    setImageFromUrl,
  }
}
