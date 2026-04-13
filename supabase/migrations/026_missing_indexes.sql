-- Index manquants identifiés lors de l'audit

-- user_exercise_rest : filtré par user_id dans les requêtes de repos personnalisé
CREATE INDEX IF NOT EXISTS idx_user_exercise_rest_user
  ON user_exercise_rest(user_id);

-- mensurations : filtré par user_id (UNIQUE constraint mais pas d'index explicite)
CREATE INDEX IF NOT EXISTS idx_mensurations_user
  ON mensurations(user_id);

-- user_aliment_favorites : filtré par (user_id, aliment_id) dans toggleFavorite / getFavorites
CREATE INDEX IF NOT EXISTS idx_user_aliment_favorites_user_aliment
  ON user_aliment_favorites(user_id, aliment_id);
