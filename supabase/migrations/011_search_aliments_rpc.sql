-- ===== MIGRATION 011 — RPC RECHERCHE ALIMENTS OPTIMISÉE =====
-- Recherche progressive avec priorité : aliments utilisés > populaires > trigram + ILIKE

-- Index composite sur nutrition_entries pour le comptage d'utilisation par user
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_aliment
  ON public.nutrition_entries(user_id, aliment_id);

-- Fonction RPC de recherche avec ranking intelligent
CREATE OR REPLACE FUNCTION public.search_aliments(
  search_query text,
  user_uuid uuid,
  max_results int DEFAULT 25
)
RETURNS TABLE (
  id uuid,
  nom text,
  marque text,
  calories int,
  proteines numeric(5,1),
  glucides numeric(5,1),
  lipides numeric(5,1),
  fibres numeric(5,1),
  sucres numeric(5,1),
  sel numeric(5,1),
  code_barres text,
  is_global boolean,
  usage_count bigint,
  match_rank real
)
LANGUAGE sql STABLE SECURITY INVOKER
AS $$
  WITH user_usage AS (
    SELECT aliment_id, count(*) AS cnt
    FROM public.nutrition_entries
    WHERE user_id = user_uuid
    GROUP BY aliment_id
  )
  SELECT
    a.id,
    a.nom,
    a.marque,
    a.calories,
    a.proteines,
    a.glucides,
    a.lipides,
    a.fibres,
    a.sucres,
    a.sel,
    a.code_barres,
    a.is_global,
    COALESCE(u.cnt, 0) AS usage_count,
    GREATEST(
      similarity(a.nom, search_query),
      similarity(a.marque, search_query),
      CASE WHEN a.nom ILIKE search_query || '%' THEN 0.9
           WHEN a.nom ILIKE '%' || search_query || '%' THEN 0.7
           WHEN a.marque ILIKE search_query || '%' THEN 0.6
           ELSE 0.0
      END
    ) AS match_rank
  FROM public.aliments a
  LEFT JOIN user_usage u ON u.aliment_id = a.id
  WHERE
    (a.is_global = true OR a.user_id = user_uuid)
    AND (
      a.nom % search_query
      OR a.nom ILIKE '%' || search_query || '%'
      OR a.marque ILIKE '%' || search_query || '%'
    )
  ORDER BY
    CASE WHEN COALESCE(u.cnt, 0) > 0 THEN 0 ELSE 1 END,
    COALESCE(u.cnt, 0) DESC,
    GREATEST(
      similarity(a.nom, search_query),
      similarity(a.marque, search_query),
      CASE WHEN a.nom ILIKE search_query || '%' THEN 0.9
           WHEN a.nom ILIKE '%' || search_query || '%' THEN 0.7
           WHEN a.marque ILIKE search_query || '%' THEN 0.6
           ELSE 0.0
      END
    ) DESC
  LIMIT max_results;
$$;
