-- PREREQUISITE: Base schema must exist before running this file.
-- If you get "relation public.profiles does not exist", apply earlier migrations first:
--   1) 20260616213835_925b5150-1f0f-47f6-9584-e9bf1bf3fe56.sql  (creates profiles + core tables)
--   2) 20260617204014_61fb07a1-aa68-4b7d-9533-074b0e8fe0a2.sql  (plan constraint)
-- Or run all migrations at once: npx supabase db push --linked

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION
      'Base schema missing: run supabase/migrations/20260616213835_925b5150-1f0f-47f6-9584-e9bf1bf3fe56.sql in Supabase SQL Editor first, then re-run this migration.';
  END IF;
END
$$;

-- Add admin role to profiles for unlimited brief generation
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin'));

-- Grant admin role to the specified account (sign up at /auth first)
UPDATE public.profiles
SET role = 'admin', plan = 'pro'
WHERE email = 'bookspower218@gmail.com';
