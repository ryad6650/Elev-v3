-- Supprime la contrainte CHECK sur les couleurs prédéfinies
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_accent_color_check;

-- accent_color stocke maintenant un hex libre (ex: "#E8860C"), défaut orange
ALTER TABLE public.profiles
  ALTER COLUMN accent_color SET DEFAULT '#E8860C';

-- Couleur secondaire : NULL = auto (dérivée), sinon hex libre
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS accent_secondary TEXT DEFAULT NULL;

-- Met à jour les anciennes valeurs nommées → hex
UPDATE public.profiles SET accent_color = CASE accent_color
  WHEN 'orange' THEN '#E8860C'
  WHEN 'green'  THEN '#22C55E'
  WHEN 'blue'   THEN '#3B82F6'
  WHEN 'purple' THEN '#A855F7'
  WHEN 'red'    THEN '#EF4444'
  WHEN 'cyan'   THEN '#06B6D4'
  WHEN 'silver' THEN '#A8A29E'
  ELSE accent_color
END
WHERE accent_color IN ('orange', 'green', 'blue', 'purple', 'red', 'cyan', 'silver');
