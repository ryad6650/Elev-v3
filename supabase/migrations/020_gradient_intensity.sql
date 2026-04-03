ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gradient_intensity INTEGER DEFAULT 50
  CHECK (gradient_intensity >= 0 AND gradient_intensity <= 100);
