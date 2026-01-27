-- ============================================
-- SHIPYARD VANLIFE - Invitation System (Parrainage)
-- Migration: 015_invitation_system
-- ============================================
-- Adds invitation code system for verified users to invite others
-- Tracks sponsorship relationships and gamification

-- ============================================
-- 1. ADD INVITATION COLUMNS TO PROFILES
-- ============================================

-- Who invited this user (NULL if registered without code)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES auth.users(id);

-- Suspension timestamp for invitation privilege (NULL = not suspended)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS invitation_suspended_until TIMESTAMPTZ;

COMMENT ON COLUMN profiles.invited_by IS 'User ID of the sponsor who invited this user (NULL if no sponsor)';
COMMENT ON COLUMN profiles.invitation_suspended_until IS 'If set, user cannot generate invitation codes until this date';

-- ============================================
-- 2. CREATE INVITATION_CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Code format: VAN-XXXX (8 chars total)
  code VARCHAR(8) UNIQUE NOT NULL,

  -- Who created this code (must be verified user)
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Who used this code (NULL if not yet used)
  used_by_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ -- NULL if not yet used
);

COMMENT ON TABLE invitation_codes IS 'Invitation codes for verified users to invite new members';
COMMENT ON COLUMN invitation_codes.code IS 'Unique invitation code in format VAN-XXXX';
COMMENT ON COLUMN invitation_codes.creator_id IS 'Verified user who generated this code';
COMMENT ON COLUMN invitation_codes.used_by_id IS 'New user who used this code to register (NULL if unused)';

-- ============================================
-- 3. CREATE INDEXES
-- ============================================

-- Fast lookup by code (for validation)
CREATE INDEX IF NOT EXISTS idx_invitation_codes_code
  ON invitation_codes(code);

-- Count codes per creator (for stats)
CREATE INDEX IF NOT EXISTS idx_invitation_codes_creator
  ON invitation_codes(creator_id);

-- Find unused codes
CREATE INDEX IF NOT EXISTS idx_invitation_codes_unused
  ON invitation_codes(creator_id)
  WHERE used_by_id IS NULL;

-- Find who invited whom
CREATE INDEX IF NOT EXISTS idx_profiles_invited_by
  ON profiles(invited_by)
  WHERE invited_by IS NOT NULL;

-- ============================================
-- 4. RLS POLICIES FOR INVITATION_CODES
-- ============================================

ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own created codes
CREATE POLICY "Users can view own invitation codes"
ON invitation_codes FOR SELECT TO authenticated
USING (creator_id = auth.uid());

-- Insert is done via RPC function (generate_invitation_code)
-- No direct insert policy needed

-- ============================================
-- 5. HELPER FUNCTION: Generate Random Code
-- ============================================

CREATE OR REPLACE FUNCTION generate_random_code()
RETURNS VARCHAR(8)
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- No I, O, 0, 1 to avoid confusion
  result VARCHAR(8);
  i INTEGER;
BEGIN
  result := 'VAN-';
  FOR i IN 1..4 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- ============================================
-- 6. RPC: Generate Invitation Code
-- ============================================

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_verification_status TEXT;
  user_suspended_until TIMESTAMPTZ;
  new_code VARCHAR(8);
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  -- Check authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get user's verification status and suspension
  SELECT verification_status, invitation_suspended_until
  INTO user_verification_status, user_suspended_until
  FROM profiles
  WHERE id = current_user_id;

  -- Must be verified to generate codes
  IF user_verification_status IS NULL OR user_verification_status != 'approved' THEN
    RAISE EXCEPTION 'Must be verified to generate invitation codes';
  END IF;

  -- Check if suspended
  IF user_suspended_until IS NOT NULL AND user_suspended_until > NOW() THEN
    RAISE EXCEPTION 'Invitation privilege suspended until %', user_suspended_until;
  END IF;

  -- Generate unique code with retry
  LOOP
    new_code := generate_random_code();
    attempt := attempt + 1;

    -- Try to insert (will fail if code exists due to UNIQUE constraint)
    BEGIN
      INSERT INTO invitation_codes (code, creator_id)
      VALUES (new_code, current_user_id);

      -- Success, exit loop
      RETURN new_code;
    EXCEPTION WHEN unique_violation THEN
      -- Code already exists, try again
      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Failed to generate unique code after % attempts', max_attempts;
      END IF;
    END;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION generate_invitation_code IS 'Generates a unique invitation code for verified users';

-- ============================================
-- 7. RPC: Use Invitation Code
-- ============================================

CREATE OR REPLACE FUNCTION use_invitation_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  code_record RECORD;
BEGIN
  -- Check authentication
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Normalize code (uppercase, trim)
  p_code := UPPER(TRIM(p_code));

  -- Find the code
  SELECT id, creator_id, used_by_id
  INTO code_record
  FROM invitation_codes
  WHERE code = p_code;

  -- Check if code exists
  IF code_record IS NULL THEN
    RAISE EXCEPTION 'Invalid invitation code';
  END IF;

  -- Check if already used
  IF code_record.used_by_id IS NOT NULL THEN
    RAISE EXCEPTION 'This invitation code has already been used';
  END IF;

  -- Check user is not using their own code
  IF code_record.creator_id = current_user_id THEN
    RAISE EXCEPTION 'Cannot use your own invitation code';
  END IF;

  -- Mark code as used
  UPDATE invitation_codes
  SET
    used_by_id = current_user_id,
    used_at = NOW()
  WHERE id = code_record.id;

  -- Update profile with sponsor info (create profile if doesn't exist)
  INSERT INTO profiles (id, invited_by)
  VALUES (current_user_id, code_record.creator_id)
  ON CONFLICT (id) DO UPDATE SET
    invited_by = code_record.creator_id,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION use_invitation_code IS 'Validates and uses an invitation code, linking the new user to their sponsor';

-- ============================================
-- 8. RPC: Get Invitation Count (Approved invitees only)
-- ============================================

CREATE OR REPLACE FUNCTION get_invitation_count(p_user_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM profiles
  WHERE invited_by = COALESCE(p_user_id, auth.uid())
    AND verification_status = 'approved';
$$;

COMMENT ON FUNCTION get_invitation_count IS 'Returns the count of approved users invited by a sponsor';

-- ============================================
-- 9. RPC: Get My Invitation Codes
-- ============================================

CREATE OR REPLACE FUNCTION get_my_invitation_codes()
RETURNS TABLE (
  id UUID,
  code TEXT,
  created_at TIMESTAMPTZ,
  used_by_id UUID,
  used_by_username TEXT,
  used_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    ic.id,
    ic.code,
    ic.created_at,
    ic.used_by_id,
    p.username as used_by_username,
    ic.used_at
  FROM invitation_codes ic
  LEFT JOIN profiles p ON p.id = ic.used_by_id
  WHERE ic.creator_id = auth.uid()
  ORDER BY ic.created_at DESC;
$$;

COMMENT ON FUNCTION get_my_invitation_codes IS 'Returns all invitation codes created by the current user';

-- ============================================
-- 10. RPC: Suspend Invitation Privilege (Admin)
-- ============================================

CREATE OR REPLACE FUNCTION suspend_invitation_privilege(
  p_user_id UUID,
  p_days INTEGER DEFAULT 90
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- TODO: Add admin role check here
  -- For now, this function exists but should be called via service role

  UPDATE profiles
  SET
    invitation_suspended_until = NOW() + (p_days || ' days')::INTERVAL,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$;

COMMENT ON FUNCTION suspend_invitation_privilege IS 'Suspends a user''s ability to generate invitation codes for X days (admin function)';

-- ============================================
-- 11. UPDATE get_my_profile TO INCLUDE INVITATION FIELDS
-- ============================================

DROP FUNCTION IF EXISTS get_my_profile();

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
  verification_status TEXT,
  -- New invitation fields
  invited_by UUID,
  invitation_suspended_until TIMESTAMPTZ,
  invitation_count INTEGER
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
    p.verification_status,
    p.invited_by,
    p.invitation_suspended_until,
    (SELECT get_invitation_count(p.id)) as invitation_count
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- ============================================
-- 12. GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION generate_invitation_code TO authenticated;
GRANT EXECUTE ON FUNCTION use_invitation_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_invitation_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_invitation_codes TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_profile TO authenticated;
-- suspend_invitation_privilege should only be called via service role (admin)
