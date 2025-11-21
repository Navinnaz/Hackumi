-- Create a `profiles` table if missing and add a trigger to auto-create a profile
-- when a new user is created by Supabase Auth.
-- Run this in the Supabase SQL editor.

-- (1) Create profiles table if it does not exist. If you already have a profiles
-- table, this will do nothing but is safe to run.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz
);

-- (2) Function to insert a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_user_created()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Try to extract common metadata fields from the auth user record.
  -- Supabase stores user metadata in `user_metadata` (or older `raw_user_meta_data`).
  INSERT INTO public.profiles (id, full_name, avatar_url, email, created_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.user_metadata->> 'full_name', NEW.raw_user_meta_data->> 'full_name'),
    COALESCE(NEW.user_metadata->> 'avatar_url', NEW.raw_user_meta_data->> 'avatar_url'),
    NEW.email,
    now()
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  RETURN NEW;
END;
$$;

-- (3) Create trigger on auth.users AFTER INSERT
-- This will run when Supabase creates a new user row on signup.
DROP TRIGGER IF EXISTS auth_user_created ON auth.users;
CREATE TRIGGER auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_user_created();

-- Notes:
-- - Run this once in the Supabase SQL editor for your project.
-- - If you use a custom schema or different claim names, adjust the JSON keys used
--   to extract `full_name` / `avatar_url` from `user_metadata` accordingly.
-- - After running this, any newly-signed-up user will automatically get a row in
--   `public.profiles` with their email and (when present) `full_name`/`avatar_url`.
