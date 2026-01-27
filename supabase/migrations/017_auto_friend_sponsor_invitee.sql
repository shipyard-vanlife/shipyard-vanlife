-- ============================================
-- SHIPYARD VANLIFE - Auto Friend Sponsor/Invitee
-- Migration: 017_auto_friend_sponsor_invitee
-- ============================================
-- Automatically creates a friendship between sponsor and invitee
-- when the invitee's verification is approved
-- Note: connections_count is updated by existing trigger on connections table

-- ============================================
-- 1. TRIGGER FUNCTION: Create Auto Connection
-- ============================================

CREATE OR REPLACE FUNCTION create_sponsor_invitee_connection()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sponsor_profile_exists BOOLEAN;
  connection_exists BOOLEAN;
BEGIN
  -- Only trigger when:
  -- 1. verification_status changes to 'approved'
  -- 2. User has a sponsor (invited_by is not null)
  IF NEW.verification_status = 'approved'
     AND (OLD.verification_status IS NULL OR OLD.verification_status != 'approved')
     AND NEW.invited_by IS NOT NULL THEN

    -- Check if sponsor profile exists
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE id = NEW.invited_by
    ) INTO sponsor_profile_exists;

    IF NOT sponsor_profile_exists THEN
      -- Sponsor profile doesn't exist yet, skip
      RETURN NEW;
    END IF;

    -- Check if connection already exists (in either direction)
    SELECT EXISTS(
      SELECT 1 FROM connections
      WHERE (sender_id = NEW.invited_by AND receiver_id = NEW.id)
         OR (sender_id = NEW.id AND receiver_id = NEW.invited_by)
    ) INTO connection_exists;

    IF connection_exists THEN
      -- Connection already exists, just ensure it's accepted
      UPDATE connections
      SET status = 'accepted', updated_at = NOW()
      WHERE (sender_id = NEW.invited_by AND receiver_id = NEW.id)
         OR (sender_id = NEW.id AND receiver_id = NEW.invited_by);
    ELSE
      -- Create new accepted connection (sponsor as sender, invitee as receiver)
      -- connections_count will be updated by existing trigger on connections table
      INSERT INTO connections (sender_id, receiver_id, status, created_at, updated_at)
      VALUES (NEW.invited_by, NEW.id, 'accepted', NOW(), NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION create_sponsor_invitee_connection IS 'Automatically creates an accepted connection between sponsor and invitee when invitee gets verified';

-- ============================================
-- 2. CREATE TRIGGER
-- ============================================

-- Drop if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_auto_friend_sponsor_invitee ON profiles;

-- Create trigger that fires after verification approval
CREATE TRIGGER trigger_auto_friend_sponsor_invitee
  AFTER UPDATE OF verification_status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_sponsor_invitee_connection();

-- ============================================
-- 3. HANDLE CASE WHERE PROFILE CREATED WITH APPROVED STATUS
-- ============================================
-- (Edge case: if profile is inserted directly with approved status)

CREATE OR REPLACE FUNCTION create_sponsor_invitee_connection_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sponsor_profile_exists BOOLEAN;
  connection_exists BOOLEAN;
BEGIN
  -- Only trigger when profile is created with approved status and has sponsor
  IF NEW.verification_status = 'approved' AND NEW.invited_by IS NOT NULL THEN

    -- Check if sponsor profile exists
    SELECT EXISTS(
      SELECT 1 FROM profiles WHERE id = NEW.invited_by
    ) INTO sponsor_profile_exists;

    IF NOT sponsor_profile_exists THEN
      RETURN NEW;
    END IF;

    -- Check if connection already exists
    SELECT EXISTS(
      SELECT 1 FROM connections
      WHERE (sender_id = NEW.invited_by AND receiver_id = NEW.id)
         OR (sender_id = NEW.id AND receiver_id = NEW.invited_by)
    ) INTO connection_exists;

    IF NOT connection_exists THEN
      -- Create accepted connection
      -- connections_count will be updated by existing trigger on connections table
      INSERT INTO connections (sender_id, receiver_id, status, created_at, updated_at)
      VALUES (NEW.invited_by, NEW.id, 'accepted', NOW(), NOW());
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop if exists
DROP TRIGGER IF EXISTS trigger_auto_friend_sponsor_invitee_insert ON profiles;

-- Create insert trigger
CREATE TRIGGER trigger_auto_friend_sponsor_invitee_insert
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_sponsor_invitee_connection_on_insert();

-- ============================================
-- 4. RETROACTIVE: Connect existing sponsor/invitee pairs
-- ============================================
-- For users who already completed verification with a sponsor

DO $$
DECLARE
  invitee RECORD;
  connection_exists BOOLEAN;
BEGIN
  -- Find all approved users with sponsors who don't have a connection yet
  FOR invitee IN
    SELECT p.id as invitee_id, p.invited_by as sponsor_id
    FROM profiles p
    WHERE p.verification_status = 'approved'
      AND p.invited_by IS NOT NULL
      AND EXISTS (SELECT 1 FROM profiles WHERE id = p.invited_by) -- Sponsor exists
  LOOP
    -- Check if connection exists
    SELECT EXISTS(
      SELECT 1 FROM connections
      WHERE (sender_id = invitee.sponsor_id AND receiver_id = invitee.invitee_id)
         OR (sender_id = invitee.invitee_id AND receiver_id = invitee.sponsor_id)
    ) INTO connection_exists;

    IF NOT connection_exists THEN
      -- Create accepted connection
      -- connections_count will be updated by existing trigger on connections table
      INSERT INTO connections (sender_id, receiver_id, status, created_at, updated_at)
      VALUES (invitee.sponsor_id, invitee.invitee_id, 'accepted', NOW(), NOW());

      RAISE NOTICE 'Created connection between sponsor % and invitee %', invitee.sponsor_id, invitee.invitee_id;
    END IF;
  END LOOP;
END;
$$;
