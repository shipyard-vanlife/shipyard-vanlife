-- ============================================
-- Migration: Add avatar_url to profiles + storage bucket
-- ============================================

-- 1. Add avatar_url column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Create storage bucket for avatars (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true);

-- 3. Storage policies for avatars bucket (run in Supabase dashboard)
-- Users can upload their own avatar
-- CREATE POLICY "Users can upload own avatar"
-- ON storage.objects FOR INSERT
-- WITH CHECK (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Users can update their own avatar
-- CREATE POLICY "Users can update own avatar"
-- ON storage.objects FOR UPDATE
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Users can delete their own avatar
-- CREATE POLICY "Users can delete own avatar"
-- ON storage.objects FOR DELETE
-- USING (
--   bucket_id = 'avatars' AND
--   auth.uid()::text = (storage.foldername(name))[1]
-- );

-- Anyone can view avatars (public bucket)
-- CREATE POLICY "Anyone can view avatars"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'avatars');
