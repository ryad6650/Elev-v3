-- Ajout colonnes portion sur la table aliments
ALTER TABLE aliments
  ADD COLUMN IF NOT EXISTS portion_nom VARCHAR(100),
  ADD COLUMN IF NOT EXISTS taille_portion_g NUMERIC(8,2);
