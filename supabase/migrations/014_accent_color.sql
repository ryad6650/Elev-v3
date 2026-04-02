-- Ajout du choix de couleur d'accent par utilisateur
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT 'orange'
  CHECK (accent_color IN ('orange', 'green', 'blue', 'purple', 'red', 'cyan', 'silver'));
