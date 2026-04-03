-- Index sur workouts(user_id, date) — utilisé par dashboard, historique, workout
CREATE INDEX IF NOT EXISTS idx_workouts_user_date
  ON public.workouts(user_id, date DESC);

-- Index sur workout_sets(workout_id) — utilisé par toutes les jointures + RLS policy
CREATE INDEX IF NOT EXISTS idx_workout_sets_workout_id
  ON public.workout_sets(workout_id);

-- Index sur poids_history(user_id, date) — utilisé par page poids + dashboard
CREATE INDEX IF NOT EXISTS idx_poids_history_user_date
  ON public.poids_history(user_id, date DESC);

-- Index sur routine_exercises(routine_id) — utilisé par getRoutineExercises + RLS
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id
  ON public.routine_exercises(routine_id);

-- Index sur nutrition_entries(user_id, date) — utilisé par page nutrition + dashboard
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date
  ON public.nutrition_entries(user_id, date);
