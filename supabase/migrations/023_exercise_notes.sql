-- Ajouter une colonne notes par exercice par utilisateur
ALTER TABLE public.user_exercise_rest
  ADD COLUMN notes TEXT NOT NULL DEFAULT '';
