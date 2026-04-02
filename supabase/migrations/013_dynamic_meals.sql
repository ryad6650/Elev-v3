-- Ajouter les nouvelles colonnes
ALTER TABLE public.nutrition_entries
  ADD COLUMN meal_number INT,
  ADD COLUMN meal_time TIMESTAMPTZ;

-- Migrer les données existantes
UPDATE public.nutrition_entries SET meal_number = 1, meal_time = (date::timestamp + interval '8 hours') WHERE repas = 'petit-dejeuner';
UPDATE public.nutrition_entries SET meal_number = 2, meal_time = (date::timestamp + interval '12 hours') WHERE repas = 'dejeuner';
UPDATE public.nutrition_entries SET meal_number = 3, meal_time = (date::timestamp + interval '19 hours') WHERE repas = 'diner';
UPDATE public.nutrition_entries SET meal_number = 4, meal_time = (date::timestamp + interval '16 hours') WHERE repas = 'snacks';

-- Rendre NOT NULL après migration
ALTER TABLE public.nutrition_entries
  ALTER COLUMN meal_number SET NOT NULL,
  ALTER COLUMN meal_time SET NOT NULL;

-- Supprimer l'ancienne colonne et sa contrainte CHECK
ALTER TABLE public.nutrition_entries DROP COLUMN repas;

-- Index pour les requêtes par date + meal_number
CREATE INDEX idx_nutrition_entries_date_meal ON public.nutrition_entries(user_id, date, meal_number);
