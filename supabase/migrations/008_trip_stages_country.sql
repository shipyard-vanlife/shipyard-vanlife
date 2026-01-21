-- ============================================
-- SHIPYARD VANLIFE - Add country to trip_stages
-- ============================================

-- Add country column (ISO 3166-1 alpha-2 code: "FR", "ES", "PT", etc.)
ALTER TABLE trip_stages ADD COLUMN country TEXT;

-- ============================================
-- UPDATE FUNCTIONS TO INCLUDE COUNTRY
-- ============================================

-- Update get_my_active_trip to include country
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
  WHERE t.user_id = auth.uid() AND t.is_active = true
  ORDER BY t.created_at DESC
  LIMIT 1;
$$;

-- Update get_all_my_trips to include country
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
    -- Get stages as JSONB array with country
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

-- Update get_trip_detail to include country
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

-- Update create_first_trip to accept country parameter
CREATE OR REPLACE FUNCTION create_first_trip(
  trip_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city_name TEXT DEFAULT NULL,
  country_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_trip_id UUID;
BEGIN
  -- Create the trip
  INSERT INTO trips (user_id, name, is_active)
  VALUES (auth.uid(), trip_name, true)
  RETURNING id INTO new_trip_id;

  -- Create the first stage with country
  INSERT INTO trip_stages (trip_id, location, city, country, stage_order)
  VALUES (
    new_trip_id,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    city_name,
    country_code,
    1
  );

  RETURN new_trip_id;
END;
$$;

-- Update add_trip_stage to accept country parameter
CREATE OR REPLACE FUNCTION add_trip_stage(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city_name TEXT DEFAULT NULL,
  country_code TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_trip_id UUID;
  next_order INTEGER;
  new_stage_id UUID;
BEGIN
  -- Get user's active trip
  SELECT id INTO active_trip_id
  FROM trips
  WHERE user_id = auth.uid() AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;

  IF active_trip_id IS NULL THEN
    RAISE EXCEPTION 'No active trip found';
  END IF;

  -- Get next stage order
  SELECT COALESCE(MAX(stage_order), 0) + 1 INTO next_order
  FROM trip_stages
  WHERE trip_id = active_trip_id;

  -- Create the stage with country
  INSERT INTO trip_stages (trip_id, location, city, country, stage_order)
  VALUES (
    active_trip_id,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    city_name,
    country_code,
    next_order
  )
  RETURNING id INTO new_stage_id;

  RETURN new_stage_id;
END;
$$;

-- Update create_new_trip to accept country parameter
CREATE OR REPLACE FUNCTION create_new_trip(
  p_name TEXT,
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION,
  p_city TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL
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

  -- Create the first stage with country
  INSERT INTO trip_stages (trip_id, location, city, country, stage_order)
  VALUES (
    new_trip_id,
    ST_SetSRID(ST_MakePoint(p_lng, p_lat), 4326)::geography,
    p_city,
    p_country,
    1
  );

  RETURN new_trip_id;
END;
$$;
