// Verification status enum
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

// Input for verification submission (from app)
export interface VerificationInput {
  firstname: string
  lastname: string
  dateOfBirth: Date
  facePhotoUri: string
  vanWithPersonPhotoUri: string
  registrationPlatePhotoUri: string
}

// Verification record from verifications table (sensitive, separate from profiles)
export interface VerificationRecord {
  id: string
  user_id: string
  date_of_birth: string
  face_photo_url: string
  van_with_person_photo_url: string
  registration_plate_photo_url: string
  submitted_at: string
  reviewed_at: string | null
  admin_notes: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

// Minimum age required for verification
export const VERIFICATION_MIN_AGE = 21

// Maximum age for validation (safety check)
export const VERIFICATION_MAX_AGE = 100
