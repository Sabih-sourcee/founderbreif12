
-- ============ updated_at trigger helper ============
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

-- ============ profiles ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER profiles_set_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ signup trigger: auto-create profile ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ briefs ============
CREATE TABLE public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.briefs TO authenticated;
GRANT SELECT ON public.briefs TO anon;
GRANT ALL ON public.briefs TO service_role;
ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "briefs_select_own" ON public.briefs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "briefs_select_published_public" ON public.briefs
  FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "briefs_insert_own" ON public.briefs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefs_update_own" ON public.briefs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefs_delete_own" ON public.briefs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX briefs_user_week_idx ON public.briefs(user_id, week_start DESC);
CREATE TRIGGER briefs_set_updated_at BEFORE UPDATE ON public.briefs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ brief_sections ============
CREATE TABLE public.brief_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id UUID NOT NULL REFERENCES public.briefs(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL CHECK (section_type IN ('focus','metrics','priorities','wins','blockers','next_week')),
  content TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(brief_id, section_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brief_sections TO authenticated;
GRANT SELECT ON public.brief_sections TO anon;
GRANT ALL ON public.brief_sections TO service_role;
ALTER TABLE public.brief_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sections_select_own" ON public.brief_sections
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid())
  );
CREATE POLICY "sections_select_public_published" ON public.brief_sections
  FOR SELECT TO anon USING (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.status = 'published')
  );
CREATE POLICY "sections_insert_own" ON public.brief_sections
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid())
  );
CREATE POLICY "sections_update_own" ON public.brief_sections
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid())
  );
CREATE POLICY "sections_delete_own" ON public.brief_sections
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.briefs b WHERE b.id = brief_id AND b.user_id = auth.uid())
  );

CREATE TRIGGER brief_sections_set_updated_at BEFORE UPDATE ON public.brief_sections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ metrics ============
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  previous_value NUMERIC,
  unit TEXT NOT NULL DEFAULT '#',
  week_start DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metrics TO authenticated;
GRANT ALL ON public.metrics TO service_role;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "metrics_select_own" ON public.metrics
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "metrics_insert_own" ON public.metrics
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metrics_update_own" ON public.metrics
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "metrics_delete_own" ON public.metrics
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX metrics_user_week_idx ON public.metrics(user_id, week_start DESC);
CREATE TRIGGER metrics_set_updated_at BEFORE UPDATE ON public.metrics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ priorities ============
CREATE TABLE public.priorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','done')),
  week_start DATE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.priorities TO authenticated;
GRANT ALL ON public.priorities TO service_role;
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "priorities_select_own" ON public.priorities
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "priorities_insert_own" ON public.priorities
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "priorities_update_own" ON public.priorities
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "priorities_delete_own" ON public.priorities
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX priorities_user_week_idx ON public.priorities(user_id, week_start DESC);
CREATE TRIGGER priorities_set_updated_at BEFORE UPDATE ON public.priorities
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
