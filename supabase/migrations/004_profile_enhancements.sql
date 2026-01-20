-- ============================================
-- SHIPYARD VANLIFE - Profile Enhancements
-- Migration: 004_profile_enhancements
-- ============================================

-- 1. Add new columns to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS total_distance_km INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS firstname TEXT,
  ADD COLUMN IF NOT EXISTS lastname TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}';

-- 2. Add comments for documentation
COMMENT ON COLUMN profiles.avatar_url IS 'User avatar/profile photo URL';
COMMENT ON COLUMN profiles.total_distance_km IS 'Total distance traveled (calculated from trips)';
COMMENT ON COLUMN profiles.firstname IS 'User first name';
COMMENT ON COLUMN profiles.lastname IS 'User last name';
COMMENT ON COLUMN profiles.bio IS 'User bio/about text';
COMMENT ON COLUMN profiles.photos IS 'Array of photo URLs (gallery)';

-- 3. Drop existing functions to allow return type changes
DROP FUNCTION IF EXISTS get_my_profile();
DROP FUNCTION IF EXISTS get_nearby_profiles(DOUBLE PRECISION, DOUBLE PRECISION, INTEGER);
DROP FUNCTION IF EXISTS get_profiles_in_zone(DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION, DOUBLE PRECISION);

-- 4. Recreate get_my_profile function with new fields
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
  photos TEXT[]
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
    p.photos
  FROM profiles p
  WHERE p.id = auth.uid();
$$;

-- 5. Recreate get_nearby_profiles with new fields
CREATE FUNCTION get_nearby_profiles(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_km INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT
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
    get_zone_center(p.location) as zone_center,
    p.city,
    p.main_specialty,
    p.skills,
    p.days_on_road,
    get_distance_km(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) as distance_km,
    p.last_location_update,
    p.firstname,
    p.lastname
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    AND ST_DWithin(
      p.location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_km * 1000
    )
  ORDER BY distance_km ASC;
$$;

-- 6. Recreate get_profiles_in_zone with new fields
CREATE FUNCTION get_profiles_in_zone(
  zone_lat DOUBLE PRECISION,
  zone_lng DOUBLE PRECISION,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  van_name TEXT,
  van_photo_url TEXT,
  zone_center JSONB,
  city TEXT,
  main_specialty skill_type,
  skills skill_type[],
  days_on_road INTEGER,
  distance_km INTEGER,
  last_location_update TIMESTAMPTZ,
  firstname TEXT,
  lastname TEXT
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
    p.last_location_update,
    p.firstname,
    p.lastname
  FROM profiles p
  WHERE
    p.is_visible = true
    AND p.id != auth.uid()
    AND p.location IS NOT NULL
    AND ROUND(ST_Y(p.location::geometry)::numeric, 1) = ROUND(zone_lat::numeric, 1)
    AND ROUND(ST_X(p.location::geometry)::numeric, 1) = ROUND(zone_lng::numeric, 1)
  ORDER BY p.last_location_update DESC;
$$;
