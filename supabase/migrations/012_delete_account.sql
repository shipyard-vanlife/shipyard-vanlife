-- ============================================
-- DELETE ACCOUNT FUNCTION
-- Supprime toutes les données utilisateur et le compte auth
-- ============================================

CREATE OR REPLACE FUNCTION delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 1. Supprimer les fichiers storage (avatars, photos profil, photos van, photos étapes)
  DELETE FROM storage.objects
  WHERE bucket_id IN ('avatars', 'profile_photos', 'van_photos', 'stage_photos')
  AND (storage.foldername(name))[1] = current_user_id::text;

  -- 2. Supprimer les trips (cascade sur trip_stages automatique via FK)
  DELETE FROM trips WHERE user_id = current_user_id;

  -- 3. Supprimer le profil
  DELETE FROM profiles WHERE id = current_user_id;

  -- 4. Supprimer le compte auth
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_my_account() TO authenticated;
