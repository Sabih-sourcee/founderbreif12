-- Standalone migration for founderbreif-landing Supabase project.
-- Includes updated_at helper required by the trigger.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.waitlist_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'invited', 'joined')),
  invited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX waitlist_signups_email_lower_idx ON public.waitlist_signups (lower(trim(email)));

GRANT INSERT ON public.waitlist_signups TO anon;
GRANT INSERT ON public.waitlist_signups TO authenticated;
GRANT ALL ON public.waitlist_signups TO service_role;

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist_insert_public" ON public.waitlist_signups
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND length(trim(email)) > 0
    AND position('@' in trim(email)) > 1
  );

CREATE TRIGGER waitlist_signups_set_updated_at
  BEFORE UPDATE ON public.waitlist_signups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
