-- ============================================
-- SHIPYARD VANLIFE - Fix Username Nullable
-- Migration: 014_fix_username_nullable
-- ============================================
-- Makes username nullable to support the verification-first flow:
-- 1. User registers
-- 2. User completes identity verification (creates partial profile)
-- 3. User completes profile setup (sets username)

-- 1. Make username nullable
ALTER TABLE profiles
  ALTER COLUMN username DROP NOT NULL;

-- 2. Add comment explaining the flow
COMMENT ON COLUMN profiles.username IS 'Username (set during profile setup, after verification)';

-- 3. Update the unique index to handle NULL values properly
-- Drop the old index
DROP INDEX IF EXISTS profiles_username_unique;

-- Create new index that only applies to non-null usernames
CREATE UNIQUE INDEX profiles_username_unique
  ON profiles (LOWER(username))
  WHERE username IS NOT NULL;
