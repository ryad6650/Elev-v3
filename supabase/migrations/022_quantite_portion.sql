-- Stocker le nombre de portions quand l'utilisateur saisit en mode portion
-- NULL = saisie en grammes, valeur = nombre de portions
ALTER TABLE nutrition_entries
  ADD COLUMN quantite_portion DECIMAL(5,1) DEFAULT NULL;
