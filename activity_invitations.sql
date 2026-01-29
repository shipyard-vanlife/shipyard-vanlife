-- Activity Invitations Table
CREATE TABLE IF NOT EXISTS activity_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  inviter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status participant_status DEFAULT 'pending',
  message TEXT,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(activity_id, invitee_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_activity_invitations_activity ON activity_invitations(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_invitations_invitee ON activity_invitations(invitee_id);
CREATE INDEX IF NOT EXISTS idx_activity_invitations_status ON activity_invitations(status);

-- RLS Policies
ALTER TABLE activity_invitations ENABLE ROW LEVEL SECURITY;

-- View own invitations (as invitee)
CREATE POLICY "Users can view their own invitations"
  ON activity_invitations FOR SELECT
  USING (
    invitee_id = auth.uid() OR
    inviter_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM activities
      WHERE activities.id = activity_invitations.activity_id
      AND activities.creator_id = auth.uid()
    )
  );

-- Send invitations (creator or participants can invite friends)
CREATE POLICY "Activity members can invite friends"
  ON activity_invitations FOR INSERT
  WITH CHECK (
    inviter_id = auth.uid() AND
    (
      EXISTS (
        SELECT 1 FROM activities
        WHERE activities.id = activity_invitations.activity_id
        AND activities.creator_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM activity_participants
        WHERE activity_participants.activity_id = activity_invitations.activity_id
        AND activity_participants.user_id = auth.uid()
        AND activity_participants.status = 'accepted'
      )
    )
  );

-- Respond to invitations
CREATE POLICY "Users can respond to their invitations"
  ON activity_invitations FOR UPDATE
  USING (invitee_id = auth.uid())
  WITH CHECK (invitee_id = auth.uid());

-- Delete invitations (inviter or invitee)
CREATE POLICY "Users can delete their invitations"
  ON activity_invitations FOR DELETE
  USING (inviter_id = auth.uid() OR invitee_id = auth.uid());

-- Function to get user's pending invitations
CREATE OR REPLACE FUNCTION get_my_activity_invitations()
RETURNS TABLE (
  id UUID,
  activity_id UUID,
  inviter_id UUID,
  inviter_username TEXT,
  inviter_avatar TEXT,
  message TEXT,
  invited_at TIMESTAMPTZ,
  activity_title TEXT,
  activity_type activity_type,
  activity_start_date TIMESTAMPTZ,
  activity_location_name TEXT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    ai.id,
    ai.activity_id,
    ai.inviter_id,
    p.username as inviter_username,
    p.avatar_url as inviter_avatar,
    ai.message,
    ai.invited_at,
    a.title as activity_title,
    a.activity_type,
    a.start_date as activity_start_date,
    a.location_name as activity_location_name
  FROM activity_invitations ai
  JOIN profiles p ON p.id = ai.inviter_id
  JOIN activities a ON a.id = ai.activity_id
  WHERE ai.invitee_id = auth.uid()
    AND ai.status = 'pending'
    AND a.status = 'open'
    AND a.start_date > NOW()
  ORDER BY ai.invited_at DESC;
$$;

GRANT EXECUTE ON FUNCTION get_my_activity_invitations() TO authenticated;

-- Function to accept invitation (adds to participants and updates invitation)
CREATE OR REPLACE FUNCTION accept_activity_invitation(invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
  v_invitee_id UUID;
  v_max_participants INTEGER;
  v_current_count INTEGER;
BEGIN
  -- Get invitation details
  SELECT activity_id, invitee_id
  INTO v_activity_id, v_invitee_id
  FROM activity_invitations
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';

  IF v_activity_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
  END IF;

  -- Check if activity is full
  SELECT max_participants INTO v_max_participants
  FROM activities
  WHERE id = v_activity_id;

  IF v_max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM activity_participants
    WHERE activity_id = v_activity_id AND status = 'accepted';

    IF v_current_count >= v_max_participants THEN
      RETURN jsonb_build_object('success', false, 'error', 'Activity is full');
    END IF;
  END IF;

  -- Add to participants
  INSERT INTO activity_participants (activity_id, user_id, status)
  VALUES (v_activity_id, v_invitee_id, 'accepted')
  ON CONFLICT (activity_id, user_id) DO UPDATE
  SET status = 'accepted';

  -- Update invitation status
  UPDATE activity_invitations
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_id;

  -- Check if activity is now full
  IF v_max_participants IS NOT NULL THEN
    SELECT COUNT(*) INTO v_current_count
    FROM activity_participants
    WHERE activity_id = v_activity_id AND status = 'accepted';

    IF v_current_count >= v_max_participants THEN
      UPDATE activities SET status = 'full' WHERE id = v_activity_id;
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION accept_activity_invitation(UUID) TO authenticated;

-- Function to decline invitation
CREATE OR REPLACE FUNCTION decline_activity_invitation(invitation_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE activity_invitations
  SET status = 'declined', responded_at = NOW()
  WHERE id = invitation_id AND invitee_id = auth.uid() AND status = 'pending';

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invitation not found');
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION decline_activity_invitation(UUID) TO authenticated;
