-- ============================================
-- SHIPYARD VANLIFE - Invitation Code Reuse
-- Migration: 016_invitation_reuse_code
-- ============================================
-- Modifies generate_invitation_code to return existing unused code
-- instead of creating duplicates

-- ============================================
-- UPDATE RPC: Generate Invitation Code
-- ============================================
-- Now returns existing unused code if available,
-- otherwise generates a new one

CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID := auth.uid();
  user_verification_status TEXT;
  user_suspended_until TIMESTAMPTZ;
  existing_code VARCHAR(8);
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

  -- Check for existing unused code
  SELECT code INTO existing_code
  FROM invitation_codes
  WHERE creator_id = current_user_id
    AND used_by_id IS NULL
  ORDER BY created_at DESC
  LIMIT 1;

  -- Return existing code if found
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  -- Generate new unique code with retry
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

COMMENT ON FUNCTION generate_invitation_code IS 'Generates or returns existing unused invitation code for verified users';
