-- Ajout colonne is_warmup sur workout_sets pour identifier les séries d'échauffement
ALTER TABLE public.workout_sets
  ADD COLUMN IF NOT EXISTS is_warmup BOOLEAN NOT NULL DEFAULT false;
