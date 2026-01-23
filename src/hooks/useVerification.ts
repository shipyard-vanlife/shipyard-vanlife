import { useMutation } from '@tanstack/react-query'
import { supabase } from '../services/supabase'
import type { VerificationInput } from '../types/verification'
import { compressImageWithPreset } from '../utils/imageCompression'

// ============================================
// UPLOAD VERIFICATION PHOTO
// ============================================

async function uploadVerificationPhoto(
  userId: string,
  photoUri: string,
  photoType: 'face' | 'van-with-person' | 'registration-plate'
): Promise<string> {
  // Compress image before upload (same approach as avatar upload)
  let finalUri = photoUri
  try {
    const compressed = await compressImageWithPreset(photoUri, 'gallery')
    finalUri = compressed.uri
  } catch (compressionError) {
    console.warn(`Image compression failed for ${photoType}, using original:`, compressionError)
  }

  const fileName = `${userId}/${photoType}.jpg`

  // Fetch the compressed image as blob
  const response = await fetch(finalUri)
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

  // Upload to verification-photos bucket
  const { error: uploadError } = await supabase.storage
    .from('verification-photos')
    .upload(fileName, bytes, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (uploadError) {
    throw new Error(`Failed to upload ${photoType}: ${uploadError.message}`)
  }

  // Get the public URL (signed URL since bucket is private)
  const { data: urlData, error: urlError } = await supabase.storage
    .from('verification-photos')
    .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year

  if (urlError || !urlData) {
    throw new Error(`Failed to get URL for ${photoType}: ${urlError?.message ?? 'No data returned'}`)
  }

  return urlData.signedUrl
}

// ============================================
// SUBMIT VERIFICATION
// ============================================

export function useSubmitVerification() {
  return useMutation({
    mutationFn: async (input: VerificationInput): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Upload all 3 photos in parallel with better error handling
      const uploadResults = await Promise.allSettled([
        uploadVerificationPhoto(user.id, input.facePhotoUri, 'face'),
        uploadVerificationPhoto(user.id, input.vanWithPersonPhotoUri, 'van-with-person'),
        uploadVerificationPhoto(user.id, input.registrationPlatePhotoUri, 'registration-plate'),
      ])

      // Check for failures and provide specific error messages
      const failedUploads: string[] = []
      const photoLabels = ['face photo', 'van with person photo', 'registration plate photo']

      uploadResults.forEach((result, index) => {
        if (result.status === 'rejected') {
          failedUploads.push(photoLabels[index])
          console.error(`Upload failed for ${photoLabels[index]}:`, result.reason)
        }
      })

      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload: ${failedUploads.join(', ')}`)
      }

      // Extract successful URLs
      const [faceResult, vanResult, plateResult] = uploadResults
      const facePhotoUrl = (faceResult as PromiseFulfilledResult<string>).value
      const vanWithPersonPhotoUrl = (vanResult as PromiseFulfilledResult<string>).value
      const registrationPlatePhotoUrl = (plateResult as PromiseFulfilledResult<string>).value

      // Format date of birth as YYYY-MM-DD
      const dateOfBirth = input.dateOfBirth.toISOString().split('T')[0]

      // Call the submit_verification RPC function
      const { error } = await supabase.rpc('submit_verification', {
        p_firstname: input.firstname.trim(),
        p_lastname: input.lastname.trim(),
        p_date_of_birth: dateOfBirth,
        p_face_photo_url: facePhotoUrl,
        p_van_with_person_photo_url: vanWithPersonPhotoUrl,
        p_registration_plate_photo_url: registrationPlatePhotoUrl,
      })

      if (error) throw error
    },
    // Note: Profile query invalidation is handled by the caller
    // to allow showing a success screen before navigating
  })
}
