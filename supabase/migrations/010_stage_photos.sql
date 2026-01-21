-- Migration: Stage Photos
-- Description: Add photos support for trip stages (max 4 photos per stage)

-- Table for stage photos
CREATE TABLE trip_stage_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES trip_stages(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  photo_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT photo_order_range CHECK (photo_order BETWEEN 1 AND 4)
);

-- Index for efficient queries
CREATE INDEX idx_stage_photos_stage_id ON trip_stage_photos(stage_id);

-- Enable RLS
ALTER TABLE trip_stage_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own stage photos" ON trip_stage_photos
FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM trip_stages ts
  JOIN trips t ON t.id = ts.trip_id
  WHERE ts.id = trip_stage_photos.stage_id AND t.user_id = auth.uid()
));

CREATE POLICY "Users can insert own stage photos" ON trip_stage_photos
FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM trip_stages ts
  JOIN trips t ON t.id = ts.trip_id
  WHERE ts.id = trip_stage_photos.stage_id AND t.user_id = auth.uid()
));

CREATE POLICY "Users can delete own stage photos" ON trip_stage_photos
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM trip_stages ts
  JOIN trips t ON t.id = ts.trip_id
  WHERE ts.id = trip_stage_photos.stage_id AND t.user_id = auth.uid()
));

-- Function to add a photo to a stage (with max 4 check)
CREATE OR REPLACE FUNCTION add_stage_photo(
  p_stage_id UUID,
  p_photo_url TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_photo_count INTEGER;
  v_next_order INTEGER;
  v_photo_id UUID;
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM trip_stages ts
    JOIN trips t ON t.id = ts.trip_id
    WHERE ts.id = p_stage_id AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Stage not found or not authorized';
  END IF;

  -- Check photo count
  SELECT COUNT(*) INTO v_photo_count
  FROM trip_stage_photos
  WHERE stage_id = p_stage_id;

  IF v_photo_count >= 4 THEN
    RAISE EXCEPTION 'Maximum 4 photos per stage';
  END IF;

  -- Get next order number
  SELECT COALESCE(MAX(photo_order), 0) + 1 INTO v_next_order
  FROM trip_stage_photos
  WHERE stage_id = p_stage_id;

  -- Insert photo
  INSERT INTO trip_stage_photos (stage_id, photo_url, photo_order)
  VALUES (p_stage_id, p_photo_url, v_next_order)
  RETURNING id INTO v_photo_id;

  RETURN v_photo_id;
END;
$$;

-- Function to delete a photo
CREATE OR REPLACE FUNCTION delete_stage_photo(
  p_photo_id UUID
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER AS $$
DECLARE
  v_stage_id UUID;
  v_photo_order INTEGER;
BEGIN
  -- Get photo info and check ownership
  SELECT sp.stage_id, sp.photo_order INTO v_stage_id, v_photo_order
  FROM trip_stage_photos sp
  JOIN trip_stages ts ON ts.id = sp.stage_id
  JOIN trips t ON t.id = ts.trip_id
  WHERE sp.id = p_photo_id AND t.user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Photo not found or not authorized';
  END IF;

  -- Delete photo
  DELETE FROM trip_stage_photos WHERE id = p_photo_id;

  -- Reorder remaining photos
  UPDATE trip_stage_photos
  SET photo_order = photo_order - 1
  WHERE stage_id = v_stage_id AND photo_order > v_photo_order;

  RETURN true;
END;
$$;

-- Function to get stage photos
CREATE OR REPLACE FUNCTION get_stage_photos(
  p_stage_id UUID
) RETURNS TABLE (
  id UUID,
  photo_url TEXT,
  photo_order INTEGER,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER AS $$
BEGIN
  -- Check ownership
  IF NOT EXISTS (
    SELECT 1 FROM trip_stages ts
    JOIN trips t ON t.id = ts.trip_id
    WHERE ts.id = p_stage_id AND t.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Stage not found or not authorized';
  END IF;

  RETURN QUERY
  SELECT sp.id, sp.photo_url, sp.photo_order, sp.created_at
  FROM trip_stage_photos sp
  WHERE sp.stage_id = p_stage_id
  ORDER BY sp.photo_order;
END;
$$;
