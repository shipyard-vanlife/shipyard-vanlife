-- Migration: Stage Photos Storage Bucket
-- Description: Create storage bucket for stage photos

-- Create the storage bucket for stage photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stage-photos',
  'stage-photos',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for stage-photos bucket

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload stage photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'stage-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own photos
CREATE POLICY "Users can read own stage photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'stage-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (since bucket is public)
CREATE POLICY "Public can view stage photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'stage-photos');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own stage photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'stage-photos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
