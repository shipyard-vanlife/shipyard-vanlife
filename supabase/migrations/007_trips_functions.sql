-- ============================================
-- SHIPYARD VANLIFE - Trips Additional Functions
-- ============================================

-- ============================================
-- 1. GET ALL MY TRIPS
-- Returns all trips for the current user with stages and computed stats
-- ============================================
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
    -- Get stages as JSONB array
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
            'arrived_at', s.arrived_at,
            'stage_order', s.stage_order
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

-- ============================================
-- 2. END TRIP
-- Ends the specified trip (sets is_active=false, end_date=today)
-- ============================================
CREATE OR REPLACE FUNCTION end_trip(p_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trip_owner UUID;
BEGIN
  -- Check trip belongs to user
  SELECT user_id INTO trip_owner
  FROM trips
  WHERE id = p_trip_id;

  IF trip_owner IS NULL THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  IF trip_owner != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update the trip
  UPDATE trips
  SET
    is_active = false,
    end_date = CURRENT_DATE
  WHERE id = p_trip_id;

  RETURN true;
END;
$$;

-- ============================================
-- 3. CREATE NEW TRIP
-- Creates a new trip with first stage
-- Fails if user already has an active trip
-- ============================================
CREATE OR REPLACE FUNCTION create_new_trip(
  p_name TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_city TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_active_trip UUID;
  new_trip_id UUID;
BEGIN
  -- Check for existing active trip
  SELECT id INTO existing_active_trip
  FROM trips
  WHERE user_id = auth.uid() AND is_active = true
  LIMIT 1;

  IF existing_active_trip IS NOT NULL THEN
    RAISE EXCEPTION 'User already has an active trip. End it first.';
  END IF;

  -- Create the new trip
  INSERT INTO trips (user_id, name, is_active, start_date)
  VALUES (auth.uid(), p_name, true, CURRENT_DATE)
  RETURNING id INTO new_trip_id;

  -- Create the first stage
  INSERT INTO trip_stages (trip_id, location, city, stage_order)
  VALUES (
    new_trip_id,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_city,
    1
  );

  RETURN new_trip_id;
END;
$$;

-- ============================================
-- 4. DELETE TRIP
-- Deletes a trip and all its stages (cascade)
-- ============================================
CREATE OR REPLACE FUNCTION delete_trip(p_trip_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  trip_owner UUID;
BEGIN
  -- Check trip belongs to user
  SELECT user_id INTO trip_owner
  FROM trips
  WHERE id = p_trip_id;

  IF trip_owner IS NULL THEN
    RAISE EXCEPTION 'Trip not found';
  END IF;

  IF trip_owner != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Delete the trip (stages deleted via CASCADE)
  DELETE FROM trips WHERE id = p_trip_id;

  RETURN true;
END;
$$;

-- ============================================
-- 5. GET TRIP DETAIL
-- Returns a single trip with all stages
-- ============================================
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
            'arrived_at', s.arrived_at,
            'stage_order', s.stage_order
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
GRANT EXECUTE ON FUNCTION get_all_my_trips TO authenticated;
GRANT EXECUTE ON FUNCTION end_trip TO authenticated;
GRANT EXECUTE ON FUNCTION create_new_trip TO authenticated;
GRANT EXECUTE ON FUNCTION delete_trip TO authenticated;
GRANT EXECUTE ON FUNCTION get_trip_detail TO authenticated;
