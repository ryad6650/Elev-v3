-- ===== MIGRATION 006 — ENRICHISSEMENT TABLE ALIMENTS =====
-- Ajout des colonnes nutritionnelles supplémentaires + index de recherche

-- Extension trigram pour la recherche ILIKE rapide sur grands volumes
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Nouvelles colonnes
ALTER TABLE public.aliments
  ADD COLUMN IF NOT EXISTS marque TEXT,
  ADD COLUMN IF NOT EXISTS code_barres TEXT,
  ADD COLUMN IF NOT EXISTS fibres DECIMAL(5,1),
  ADD COLUMN IF NOT EXISTS sucres DECIMAL(5,1),
  ADD COLUMN IF NOT EXISTS sel DECIMAL(5,1);

-- Index GIN trigram sur nom — accélère les ILIKE sur 50k+ lignes
CREATE INDEX IF NOT EXISTS idx_aliments_nom_trgm
  ON public.aliments USING gin(nom gin_trgm_ops);

-- Index B-tree sur code_barres pour les lookups scan/déduplications
CREATE INDEX IF NOT EXISTS idx_aliments_code_barres
  ON public.aliments(code_barres)
  WHERE code_barres IS NOT NULL;

-- Index partiel sur les aliments globaux (scope seed OFT)
CREATE INDEX IF NOT EXISTS idx_aliments_global_nom
  ON public.aliments(nom)
  WHERE is_global = true;
