-- Suivi du streak de connexions quotidiennes
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS streak_connexions INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS derniere_connexion DATE;
