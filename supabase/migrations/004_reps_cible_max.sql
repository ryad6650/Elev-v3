-- Ajout de la colonne reps_cible_max pour les fourchettes de répétitions (ex: 8-12)
-- NULL = chiffre unique, sinon c'est le maximum de la fourchette
ALTER TABLE public.routine_exercises
  ADD COLUMN IF NOT EXISTS reps_cible_max INTEGER DEFAULT NULL;
