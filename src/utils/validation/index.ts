// Schemas
export {
  usernameSchema,
  vanNameSchema,
  vanNameOptionalSchema,
  skillSchema,
  bioSchema,
  createProfileSchema,
  completeProfileSchema,
  updateProfileSchema,
  coordinatesSchema,
  updateLocationSchema,
  tripNameSchema,
  createTripSchema,
  // Verification schemas
  firstnameSchema,
  lastnameSchema,
  dateOfBirthSchema,
  photoUriSchema,
  verificationSchema,
} from './schemas'

export type {
  CreateProfileInput,
  UpdateProfileInput,
  UpdateLocationInput,
  CreateTripValidatedInput,
  VerificationValidatedInput,
} from './schemas'

// Error utilities
export { parseSupabaseError, getFirstZodError, getFieldErrors } from './errors'
