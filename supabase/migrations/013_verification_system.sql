-- ============================================
-- SHIPYARD VANLIFE - Verification System
-- Migration: 013_verification_system
-- ============================================
-- Adds identity verification for trusted community
-- Uses SEPARATE table for sensitive verification data

-- ============================================
-- 1. ADD MINIMAL VERIFICATION COLUMNS TO PROFILES
-- ============================================
-- Only public/needed data stays in profiles

-- Verification status (needed for visibility filtering)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT NULL
    CHECK (verification_status IS NULL OR verification_status IN ('pending', 'approved', 'rejected'));

COMMENT ON COLUMN profiles.verification_status IS 'Verification status: null (not submitted), pending, approved, rejected';

-- ============================================
-- 2. CREATE VERIFICATIONS TABLE (Sensitive Data)
-- ============================================

CREATE TABLE IF NOT EXISTS verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identity data
  date_of_birth DATE NOT NULL,

  -- Verification photos (private, admin-only)
  face_photo_url TEXT NOT NULL,
  van_with_person_photo_url TEXT NOT NULL,
  registration_plate_photo_url TEXT NOT NULL,

  -- Timestamps
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,

  -- Admin data
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments for documentation
COMMENT ON TABLE verifications IS 'Sensitive verification data - separate from public profiles';
COMMENT ON COLUMN verifications.user_id IS 'Reference to auth.users (not profiles, since profile may not exist yet)';
COMMENT ON COLUMN verifications.date_of_birth IS 'User date of birth for age verification (21+ required)';
COMMENT ON COLUMN verifications.face_photo_url IS 'URL of face photo for identity verification';
COMMENT ON COLUMN verifications.van_with_person_photo_url IS 'URL of photo with person in front of van';
COMMENT ON COLUMN verifications.registration_plate_photo_url IS 'URL of vehicle registration plate photo';
COMMENT ON COLUMN verifications.admin_notes IS 'Admin notes (e.g., rejection reason)';

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status
  ON profiles(verification_status)
  WHERE verification_status IS NOT NULL;

-- Index for looking up verification by user
CREATE INDEX IF NOT EXISTS idx_verifications_user_id
  ON verifications(user_id);

-- Index for pending verifications (admin queue)
CREATE INDEX IF NOT EXISTS idx_verifications_pending
  ON verifications(submitted_at)
  WHERE reviewed_at IS NULL;

-- ============================================
-- 4. RLS POLICIES FOR VERIFICATIONS TABLE
-- ============================================

ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own verification
CREATE POLICY "Users can view own verification"
ON verifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can insert their own verification (once)
CREATE POLICY "Users can insert own verification"
ON verifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own verification (if not yet reviewed)
CREATE POLICY "Users can update own pending verification"
ON verifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() AND reviewed_at IS NULL);

-- Users cannot delete verifications (admin only via service role)

-- ============================================
-- 5. CREATE VERIFICATION PHOTOS BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-photos', 'verification-photos', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload their own verification photos
CREATE POLICY "Users can upload own verification photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can view their own verification photos
CREATE POLICY "Users can view own verification photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can update their own verification photos
CREATE POLICY "Users can update own verification photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'verification-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policy: Users can delete their own verification photos
CREATE POLICY "Users can delete own verification photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'verification-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 6. UPDATE RPC FUNCTIONS
-- ============================================
-- Add verification_status = 'approved' filter to visibility queries
-- Users must be both: is_visible = true AND verification_status = 'approved'

-- 6.1 Drop existing functions
DROP FUNCTION IF EXISTS get_my_profile();
DROP FUNCTION IF EXISTS get_all_visible_profiles();
DROP FUNCTION IF EXISTS get_nearby_profiles(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);
DROP FUNCTION IF EXISTS get_profiles_in_zone(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

-- 6.2 Recreate get_my_profile with verification status
CREATE FUNCTION get_my_profile()
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  location JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  total_distance_km INTEGER,
  connections_count INTEGER,
  is_visible BOOLEAN,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT,
  bio TEXT,
  photos TEXT[],
  -- Verification status only (sensitive data in verifications table)
  verification_status TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.van_name,
    p.van_photo_url,
    CASE
      WHEN p.location IS NULL THEN NULL
      ELSE jsonb_build_object(
        'latitude', ST_Y(p.location::geometry),
        'longitude', ST_X(p.location::geometry)
      )
    END as location,
    p.city,
    p.main_specialty,
    p.skills,
    p.days_on_road,
    p.total_distance_km,
    p.connections_count,
    p.is_visible,
    p.last_location_update,
    p.created_at,
    p.updated_at,
    p.firstname,
    p.lastname,
    p.bio,
    p.photos,
    p.verification_status
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- 6.3 Recreate get_all_visible_profiles with verification filter
CREATE FUNCTION get_all_visible_profiles()
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  location JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  connections_count INTEGER,
  is_visible BOOLEAN,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.van_name,
    p.van_photo_url,
    CASE
      WHEN p.location IS NULL THEN NULL
      ELSE jsonb_build_object(
        'latitude', ST_Y(p.location::geometry),
        'longitude', ST_X(p.location::geometry)
      )
    END as location,
    p.city,
    p.main_specialty,
    p.skills,
    p.days_on_road,
    p.connections_count,
    p.is_visible,
    p.last_location_update,
    p.created_at,
    p.updated_at,
    p.firstname,
    p.lastname
  FROM profiles p
  WHERE p.is_visible = true
    AND p.verification_status = 'approved'  -- Only verified users
    AND p.id != auth.uid()
    AND p.location IS NOT NULL;
$$;

-- 6.4 Recreate get_nearby_profiles with verification filter
CREATE FUNCTION get_nearby_profiles(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.van_name,
    p.van_photo_url,
    get_zone_center(p.location) as zone_center,
    p.city,
    p.main_specialty,
    p.skills,
    p.days_on_road,
    get_distance_km(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_km,
    p.last_location_update,
    p.firstname,
    p.lastname
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.verification_status = 'approved'  -- Only verified users
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
$$;

-- 6.5 Recreate get_profiles_in_zone with verification filter
CREATE FUNCTION get_profiles_in_zone(
  zone_lat DOUBLE PRECISION,
  zone_lng DOUBLE PRECISION,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
    p.avatar_url,
    p.van_name,
    p.van_photo_url,
    get_zone_center(p.location) as zone_center,
    p.city,
    p.main_specialty,
    p.skills,
    p.days_on_road,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL THEN
        get_distance_km(
          p.location,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        )
      ELSE NULL
    END as distance_km,
    p.last_location_update,
    p.firstname,
    p.lastname
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.verification_status = 'approved'  -- Only verified users
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    AND ROUND(ST_Y(p.location::geometry)::numeric, 1) = ROUND(zone_lat::numeric, 1)
    AND ROUND(ST_X(p.location::geometry)::numeric, 1) = ROUND(zone_lng::numeric, 1)
  ORDER BY p.last_location_update DESC;
$$;

-- ============================================
-- 7. CREATE VERIFICATION SUBMISSION FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION submit_verification(
  p_firstname TEXT,
  p_lastname TEXT,
  p_date_of_birth DATE,
  p_face_photo_url TEXT,
  p_van_with_person_photo_url TEXT,
  p_registration_plate_photo_url TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_age INTEGER;
BEGIN
  -- Check authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate age
  user_age := DATE_PART('year', AGE(p_date_of_birth));

  -- Validate age (21+ required)
  IF user_age < 21 THEN
    RAISE EXCEPTION 'Must be at least 21 years old';
  END IF;

  -- Validate age not unreasonably high
  IF user_age > 100 THEN
    RAISE EXCEPTION 'Invalid date of birth';
  END IF;

  -- Insert verification data into verifications table
  INSERT INTO verifications (
    user_id,
    date_of_birth,
    face_photo_url,
    van_with_person_photo_url,
    registration_plate_photo_url,
    submitted_at
  )
  VALUES (
    current_user_id,
    p_date_of_birth,
    p_face_photo_url,
    p_van_with_person_photo_url,
    p_registration_plate_photo_url,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    date_of_birth = EXCLUDED.date_of_birth,
    face_photo_url = EXCLUDED.face_photo_url,
    van_with_person_photo_url = EXCLUDED.van_with_person_photo_url,
    registration_plate_photo_url = EXCLUDED.registration_plate_photo_url,
    submitted_at = NOW(),
    reviewed_at = NULL,  -- Reset review status
    admin_notes = NULL,
    updated_at = NOW();

  -- Insert or update profile with verification status and identity
  INSERT INTO profiles (
    id,
    firstname,
    lastname,
    verification_status
  )
  VALUES (
    current_user_id,
    p_firstname,
    p_lastname,
    'pending'
  )
  ON CONFLICT (id) DO UPDATE SET
    firstname = EXCLUDED.firstname,
    lastname = EXCLUDED.lastname,
    verification_status = 'pending',
    updated_at = NOW();

  RETURN current_user_id;
END;
$$;

-- ============================================
-- 8. CREATE ADMIN REVIEW FUNCTION (Future Use)
-- ============================================

CREATE OR REPLACE FUNCTION review_verification(
  p_user_id UUID,
  p_approved BOOLEAN,
  p_admin_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_id UUID := auth.uid();
BEGIN
  -- TODO: Add admin role check here
  -- For now, this function exists but should be called via service role

  -- Update verification record
  UPDATE verifications
  SET
    reviewed_at = NOW(),
    reviewed_by = admin_id,
    admin_notes = p_admin_notes,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Update profile verification status
  UPDATE profiles
  SET
    verification_status = CASE WHEN p_approved THEN 'approved' ELSE 'rejected' END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

-- ============================================
-- 9. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION get_my_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_all_visible_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profiles_in_zone TO authenticated;
GRANT EXECUTE ON FUNCTION submit_verification TO authenticated;
-- review_verification should only be called via service role (admin)
