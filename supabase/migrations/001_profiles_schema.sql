-- ============================================
-- SHIPYARD VANLIFE - Database Schema
-- ============================================

-- 1. Verify PostGIS is enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create skill enum type
CREATE TYPE skill_type AS ENUM (
  'mechanic',
  'plumbing',
  'decoration',
  'construction',
  'electricity',
  'carpentry'
);

-- 3. Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  van_name TEXT,
  van_photo_url TEXT,

  -- Location: exact coords stored, but protected by RLS
  location GEOGRAPHY(Point, 4326),
  city TEXT,

  -- Skills
  main_specialty skill_type,
  skills skill_type[] DEFAULT '{}',

  -- Stats
  days_on_road INTEGER DEFAULT 0,
  connections_count INTEGER DEFAULT 0,

  -- Visibility & timestamps
  is_visible BOOLEAN DEFAULT true,
  last_location_update TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create unique index on username
CREATE UNIQUE INDEX profiles_username_unique ON profiles (LOWER(username));

-- 5. Create spatial index for location queries
CREATE INDEX profiles_location_gist ON profiles USING GIST (location);

-- 6. Create index for visibility filter
CREATE INDEX profiles_is_visible ON profiles (is_visible) WHERE is_visible = true;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to get zone center (blurred coords ~11km precision)
-- Rounds to 0.1 degree which is approximately 11km
CREATE OR REPLACE FUNCTION get_zone_center(loc GEOGRAPHY)
RETURNS JSONB
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN loc IS NULL THEN NULL
    ELSE jsonb_build_object(
      'latitude', ROUND(ST_Y(loc::geometry)::numeric, 1),
      'longitude', ROUND(ST_X(loc::geometry)::numeric, 1)
    )
  END;
$$;

-- Function to calculate approximate distance (in km) between two points
CREATE OR REPLACE FUNCTION get_distance_km(loc1 GEOGRAPHY, loc2 GEOGRAPHY)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN loc1 IS NULL OR loc2 IS NULL THEN NULL
    ELSE ROUND(ST_Distance(loc1, loc2) / 1000)::INTEGER
  END;
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own full profile (with exact location)
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- SECURE FUNCTION TO GET NEARBY PROFILES
-- ============================================
-- This function returns other users with BLURRED location
-- Users never see exact coords of others

CREATE OR REPLACE FUNCTION get_nearby_profiles(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
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
    p.last_location_update
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000  -- Convert km to meters
    )
  ORDER BY distance_km ASC;
$$;

-- ============================================
-- FUNCTION TO GET PROFILES IN A ZONE
-- ============================================
-- Used when user taps on a zone to see who's there

CREATE OR REPLACE FUNCTION get_profiles_in_zone(
  zone_lat DOUBLE PRECISION,
  zone_lng DOUBLE PRECISION,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
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
    p.last_location_update
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    -- Match profiles whose blurred zone matches the requested zone
    AND ROUND(ST_Y(p.location::geometry)::numeric, 1) = ROUND(zone_lat::numeric, 1)
    AND ROUND(ST_X(p.location::geometry)::numeric, 1) = ROUND(zone_lng::numeric, 1)
  ORDER BY p.last_location_update DESC;
$$;

-- ============================================
-- FUNCTION TO UPDATE USER LOCATION
-- ============================================

CREATE OR REPLACE FUNCTION update_my_location(
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  city_name TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET
    location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    city = COALESCE(city_name, city),
    last_location_update = now()
  WHERE id = auth.uid();

  RETURN FOUND;
END;
$$;

-- ============================================
-- FUNCTION TO GET OWN PROFILE
-- ============================================
-- Returns the authenticated user's profile with location as JSON

CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS TABLE (
  id UUID,
  username TEXT,
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
  updated_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.id,
    p.username,
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
    p.updated_at
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant execute on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_my_profile TO authenticated;
GRANT EXECUTE ON FUNCTION get_nearby_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION get_profiles_in_zone TO authenticated;
GRANT EXECUTE ON FUNCTION update_my_location TO authenticated;
