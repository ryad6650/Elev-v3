-- RPC pour consolider les 7 queries du dashboard en 1 seul appel
CREATE OR REPLACE FUNCTION get_dashboard_data(
  p_today DATE,
  p_week_start DATE,
  p_thirty_days_ago DATE,
  p_seven_weeks_ago DATE
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'prenom', p.prenom,
        'photo_url', p.photo_url,
        'objectif_calories', p.objectif_calories,
        'objectif_proteines', p.objectif_proteines,
        'objectif_glucides', p.objectif_glucides,
        'objectif_lipides', p.objectif_lipides,
        'streak_connexions', p.streak_connexions,
        'derniere_connexion', p.derniere_connexion,
        'theme', p.theme,
        'accent_color', p.accent_color
      )
      FROM profiles p WHERE p.id = v_user_id
    ),
    'nutrition_today', (
      SELECT COALESCE(json_agg(json_build_object(
        'quantite_g', ne.quantite_g,
        'calories', a.calories,
        'proteines', a.proteines,
        'glucides', a.glucides,
        'lipides', a.lipides
      )), '[]'::json)
      FROM nutrition_entries ne
      JOIN aliments a ON a.id = ne.aliment_id
      WHERE ne.user_id = v_user_id AND ne.date = p_today
    ),
    'poids_history', (
      SELECT COALESCE(json_agg(json_build_object(
        'poids', ph.poids,
        'date', ph.date
      ) ORDER BY ph.date DESC), '[]'::json)
      FROM poids_history ph
      WHERE ph.user_id = v_user_id AND ph.date >= p_thirty_days_ago
    ),
    'workout_dates', (
      SELECT COALESCE(json_agg(json_build_object('date', w.date)), '[]'::json)
      FROM (
        SELECT w2.date FROM workouts w2
        WHERE w2.user_id = v_user_id AND w2.date >= p_seven_weeks_ago
        LIMIT 100
      ) w
    ),
    'nutrition_dates', (
      SELECT COALESCE(json_agg(DISTINCT nd.date), '[]'::json)
      FROM nutrition_entries nd
      WHERE nd.user_id = v_user_id AND nd.date >= p_seven_weeks_ago
    ),
    'latest_routine', (
      SELECT json_build_object(
        'id', r.id,
        'nom', r.nom,
        'jours', r.jours,
        'exercises', (
          SELECT COALESCE(json_agg(json_build_object(
            'series_cible', re.series_cible,
            'groupe_musculaire', e.groupe_musculaire
          )), '[]'::json)
          FROM routine_exercises re
          LEFT JOIN exercises e ON e.id = re.exercise_id
          WHERE re.routine_id = r.id
        )
      )
      FROM routines r
      WHERE r.user_id = v_user_id
      ORDER BY r.created_at DESC
      LIMIT 1
    ),
    'sommeil', (
      SELECT json_build_object('duree_minutes', s.duree_minutes)
      FROM sommeil s
      WHERE s.user_id = v_user_id AND s.date = p_today
      LIMIT 1
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$;
