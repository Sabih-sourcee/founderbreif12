-- Lock down profiles.plan to known values
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro'));

-- Drop unused anon SELECT policies (no UI exposes public briefs yet)
DROP POLICY IF EXISTS "Anyone can view published briefs" ON public.briefs;
DROP POLICY IF EXISTS "Anyone can view sections of published briefs" ON public.brief_sections;
REVOKE SELECT ON public.briefs FROM anon;
REVOKE SELECT ON public.brief_sections FROM anon;