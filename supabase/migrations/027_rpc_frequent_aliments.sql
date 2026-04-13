-- RPC pour récupérer les aliments les plus fréquents d'un utilisateur
-- Remplace le fetch de 200 entrées + tri côté JS

CREATE OR REPLACE FUNCTION get_frequent_aliments(user_uuid uuid, max_results int DEFAULT 20)
RETURNS TABLE (
  id uuid,
  nom text,
  marque text,
  calories numeric,
  proteines numeric,
  glucides numeric,
  lipides numeric,
  fibres numeric,
  sucres numeric,
  sel numeric,
  code_barres text,
  is_global boolean,
  portion_nom text,
  taille_portion_g numeric,
  usage_count bigint
) AS $$
  SELECT
    a.id, a.nom, a.marque, a.calories, a.proteines, a.glucides, a.lipides,
    a.fibres, a.sucres, a.sel, a.code_barres, a.is_global,
    a.portion_nom, a.taille_portion_g,
    COUNT(*) AS usage_count
  FROM nutrition_entries ne
  JOIN aliments a ON a.id = ne.aliment_id
  WHERE ne.user_id = user_uuid
  GROUP BY a.id
  ORDER BY usage_count DESC
  LIMIT max_results;
$$ LANGUAGE sql STABLE SECURITY DEFINER;
