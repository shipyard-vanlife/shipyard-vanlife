-- ============================================
-- Migration: Van photos storage bucket
-- ============================================

-- 1. Create storage bucket for van photos (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('van-photos', 'van-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage policies for van-photos bucket

-- Anyone can view van photos (public bucket)
CREATE POLICY "Anyone can view van photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'van-photos');

-- Users can upload to their own folder
CREATE POLICY "Users can upload own van photo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'van-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own van photo
CREATE POLICY "Users can update own van photo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'van-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own van photo
CREATE POLICY "Users can delete own van photo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'van-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
