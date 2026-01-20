-- ============================================
-- Migration: Profile photos storage bucket + max 5 constraint
-- ============================================

-- 1. Create storage bucket for profile photos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-photos', 'profile-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for profile-photos bucket

-- Anyone can view profile photos (public bucket)
CREATE POLICY "Anyone can view profile photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-photos');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own profile photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own photos
CREATE POLICY "Users can update own profile photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own photos
CREATE POLICY "Users can delete own profile photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 3. Trigger function to enforce max 5 photos per profile
CREATE OR REPLACE FUNCTION check_max_photos()
RETURNS TRIGGER AS $$
BEGIN
  -- Only check if photos array has more than 5 elements
  IF array_length(NEW.photos, 1) > 5 THEN
    RAISE EXCEPTION 'Maximum 5 photos allowed per profile';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger on profiles table
DROP TRIGGER IF EXISTS enforce_max_photos ON profiles;
CREATE TRIGGER enforce_max_photos
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_max_photos();
