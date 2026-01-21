-- ============================================
-- SHIPYARD VANLIFE - Add notes to trip_stages
-- ============================================

-- Add note column to trip_stages
ALTER TABLE trip_stages ADD COLUMN note TEXT;

-- ============================================
-- 1. UPDATE STAGE NOTE
-- Updates the note of a specific stage
-- ============================================
CREATE OR REPLACE FUNCTION update_stage_note(
  p_stage_id UUID,
  p_note TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update note only if user owns the trip
  UPDATE trip_stages
  SET note = p_note
  WHERE id = p_stage_id
  AND EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_stages.trip_id AND t.user_id = auth.uid()
  );

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stage not found or not authorized';
  END IF;

  RETURN true;
END;
$$;

-- ============================================
-- 2. DELETE TRIP STAGE
-- Deletes a stage (cannot delete first stage)
-- Reorders remaining stages
-- ============================================
CREATE OR REPLACE FUNCTION delete_trip_stage(p_stage_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_trip_id UUID;
  v_stage_order INTEGER;
BEGIN
  -- Get stage info
  SELECT trip_id, stage_order INTO v_trip_id, v_stage_order
  FROM trip_stages
  WHERE id = p_stage_id;

  IF v_trip_id IS NULL THEN
    RAISE EXCEPTION 'Stage not found';
  END IF;

  -- Check user owns the trip
  IF NOT EXISTS (
    SELECT 1 FROM trips WHERE id = v_trip_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Cannot delete first stage
  IF v_stage_order = 1 THEN
    RAISE EXCEPTION 'Cannot delete first stage';
  END IF;

  -- Delete the stage
  DELETE FROM trip_stages WHERE id = p_stage_id;

  -- Reorder remaining stages
  UPDATE trip_stages
  SET stage_order = stage_order - 1
  WHERE trip_id = v_trip_id AND stage_order > v_stage_order;

  RETURN true;
END;
$$;

-- ============================================
-- UPDATE EXISTING FUNCTIONS TO INCLUDE NOTE
-- ============================================

-- Update get_my_active_trip to include note
CREATE OR REPLACE FUNCTION get_my_active_trip()
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  stages JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    t.id,
    t.name,
    t.start_date,
    t.is_active,
    t.created_at,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'location', jsonb_build_object(
              'latitude', ST_Y(s.location::geometry),
              'longitude', ST_X(s.location::geometry)
            ),
            'city', s.city,
            'country', s.country,
            'arrived_at', s.arrived_at,
            'stage_order', s.stage_order,
            'note', s.note
          )
          ORDER BY s.stage_order
        )
        FROM trip_stages s
        WHERE s.trip_id = t.id
      ),
      '[]'::jsonb
    ) as stages
  FROM trips t
  WHERE t.user_id = auth.uid() AND t.is_active = true
  ORDER BY t.created_at DESC
  LIMIT 1;
$$;

-- Update get_all_my_trips to include note
CREATE OR REPLACE FUNCTION get_all_my_trips()
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  days_count INTEGER,
  stages_count INTEGER,
  total_distance_km DOUBLE PRECISION,
  stages JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    t.id,
    t.name,
    t.start_date,
    t.end_date,
    t.is_active,
    t.created_at,
    -- Calculate days_count dynamically
    CASE
      WHEN t.is_active THEN (CURRENT_DATE - t.start_date + 1)::INTEGER
      WHEN t.end_date IS NOT NULL THEN (t.end_date - t.start_date + 1)::INTEGER
      ELSE 1
    END as days_count,
    -- Count stages
    (SELECT COUNT(*)::INTEGER FROM trip_stages s WHERE s.trip_id = t.id) as stages_count,
    -- Calculate total distance in km (sum of distances between consecutive stages)
    COALESCE(
      (
        SELECT ROUND((SUM(ST_Distance(s1.location, s2.location)) / 1000)::NUMERIC, 1)::DOUBLE PRECISION
        FROM trip_stages s1
        JOIN trip_stages s2 ON s1.trip_id = s2.trip_id AND s2.stage_order = s1.stage_order + 1
        WHERE s1.trip_id = t.id
      ),
      0
    ) as total_distance_km,
    -- Get stages as JSONB array with note
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'location', jsonb_build_object(
              'latitude', ST_Y(s.location::geometry),
              'longitude', ST_X(s.location::geometry)
            ),
            'city', s.city,
            'country', s.country,
            'arrived_at', s.arrived_at,
            'stage_order', s.stage_order,
            'note', s.note
          )
          ORDER BY s.stage_order
        )
        FROM trip_stages s
        WHERE s.trip_id = t.id
      ),
      '[]'::jsonb
    ) as stages
  FROM trips t
  WHERE t.user_id = auth.uid()
  ORDER BY t.is_active DESC, t.created_at DESC;
$$;

-- Update get_trip_detail to include note
CREATE OR REPLACE FUNCTION get_trip_detail(p_trip_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  days_count INTEGER,
  stages_count INTEGER,
  total_distance_km DOUBLE PRECISION,
  stages JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    t.id,
    t.name,
    t.start_date,
    t.end_date,
    t.is_active,
    t.created_at,
    CASE
      WHEN t.is_active THEN (CURRENT_DATE - t.start_date + 1)::INTEGER
      WHEN t.end_date IS NOT NULL THEN (t.end_date - t.start_date + 1)::INTEGER
      ELSE 1
    END as days_count,
    (SELECT COUNT(*)::INTEGER FROM trip_stages s WHERE s.trip_id = t.id) as stages_count,
    -- Calculate total distance in km
    COALESCE(
      (
        SELECT ROUND((SUM(ST_Distance(s1.location, s2.location)) / 1000)::NUMERIC, 1)::DOUBLE PRECISION
        FROM trip_stages s1
        JOIN trip_stages s2 ON s1.trip_id = s2.trip_id AND s2.stage_order = s1.stage_order + 1
        WHERE s1.trip_id = t.id
      ),
      0
    ) as total_distance_km,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'location', jsonb_build_object(
              'latitude', ST_Y(s.location::geometry),
              'longitude', ST_X(s.location::geometry)
            ),
            'city', s.city,
            'country', s.country,
            'arrived_at', s.arrived_at,
            'stage_order', s.stage_order,
            'note', s.note
          )
          ORDER BY s.stage_order
        )
        FROM trip_stages s
        WHERE s.trip_id = t.id
      ),
      '[]'::jsonb
    ) as stages
  FROM trips t
  WHERE t.id = p_trip_id AND t.user_id = auth.uid();
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT EXECUTE ON FUNCTION update_stage_note TO authenticated;
GRANT EXECUTE ON FUNCTION delete_trip_stage TO authenticated;
