-- ===== MIGRATION 024 — DEDUPLICATE code_barres + ADD UNIQUE CONSTRAINT =====

-- Step 1: Reassign nutrition_entries pointing to duplicates
WITH keepers AS (
  SELECT code_barres, MIN(id::text)::uuid AS keep_id
  FROM public.aliments
  WHERE code_barres IS NOT NULL
  GROUP BY code_barres
  HAVING COUNT(*) > 1
)
UPDATE public.nutrition_entries ne
SET aliment_id = k.keep_id
FROM keepers k
JOIN public.aliments a ON a.code_barres = k.code_barres AND a.id != k.keep_id
WHERE ne.aliment_id = a.id;

-- Step 2: Delete favorites pointing to duplicate aliments
WITH keepers AS (
  SELECT code_barres, MIN(id::text)::uuid AS keep_id
  FROM public.aliments
  WHERE code_barres IS NOT NULL
  GROUP BY code_barres
  HAVING COUNT(*) > 1
)
DELETE FROM public.user_aliment_favorites uf
USING keepers k
JOIN public.aliments a ON a.code_barres = k.code_barres AND a.id != k.keep_id
WHERE uf.aliment_id = a.id;

-- Step 3: Delete duplicate rows (keep MIN id per code_barres)
WITH keepers AS (
  SELECT code_barres, MIN(id::text)::uuid AS keep_id
  FROM public.aliments
  WHERE code_barres IS NOT NULL
  GROUP BY code_barres
  HAVING COUNT(*) > 1
)
DELETE FROM public.aliments a
USING keepers k
WHERE a.code_barres = k.code_barres
  AND a.id != k.keep_id;

-- Step 4: Add UNIQUE constraint
ALTER TABLE public.aliments
  ADD CONSTRAINT aliments_code_barres_unique UNIQUE (code_barres);

-- Drop the old non-unique index (now redundant)
DROP INDEX IF EXISTS idx_aliments_code_barres;
