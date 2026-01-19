-- ============================================
-- SHIPYARD VANLIFE - Trips Schema
-- ============================================

-- 1. Create trips table
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create trip_stages table
CREATE TABLE trip_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  city TEXT,
  arrived_at TIMESTAMPTZ DEFAULT now(),
  stage_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================

-- Index for user's trips lookup
CREATE INDEX trips_user_id ON trips (user_id);

-- Index for active trips filter
CREATE INDEX trips_is_active ON trips (is_active) WHERE is_active = true;

-- Index for trip stages lookup
CREATE INDEX trip_stages_trip_id ON trip_stages (trip_id);

-- Spatial index for stage locations
CREATE INDEX trip_stages_location_gist ON trip_stages USING GIST (location);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on trips table
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Enable RLS on trip_stages table
ALTER TABLE trip_stages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own trips
CREATE POLICY "Users can read own trips"
  ON trips
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own trips
CREATE POLICY "Users can insert own trips"
  ON trips
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON trips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON trips
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can read stages of their own trips
CREATE POLICY "Users can read own trip stages"
  ON trip_stages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stages.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can insert stages to their own trips
CREATE POLICY "Users can insert own trip stages"
  ON trip_stages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stages.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can update stages of their own trips
CREATE POLICY "Users can update own trip stages"
  ON trip_stages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stages.trip_id
      AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stages.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- Policy: Users can delete stages of their own trips
CREATE POLICY "Users can delete own trip stages"
  ON trip_stages
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trips
      WHERE trips.id = trip_stages.trip_id
      AND trips.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to create first trip with first stage
-- Called after profile creation
CREATE OR REPLACE FUNCTION create_first_trip(
  trip_name TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city_name TEXT DEFAULT NULL
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

  -- Create the first stage
  INSERT INTO trip_stages (trip_id, location, city, stage_order)
  VALUES (
    new_trip_id,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    city_name,
    1
  );

  RETURN new_trip_id;
END;
$$;

-- Function to add a new stage to active trip
CREATE OR REPLACE FUNCTION add_trip_stage(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city_name TEXT DEFAULT NULL
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

  -- Create the stage
  INSERT INTO trip_stages (trip_id, location, city, stage_order)
  VALUES (
    active_trip_id,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    city_name,
    next_order
  )
  RETURNING id INTO new_stage_id;

  RETURN new_stage_id;
END;
$$;

-- Function to get user's active trip with stages
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

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION create_first_trip TO authenticated;
GRANT EXECUTE ON FUNCTION add_trip_stage TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_active_trip TO authenticated;
