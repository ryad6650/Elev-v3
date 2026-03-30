-- ===== ÉLEV V3 — INITIAL SCHEMA =====

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== TABLES =====

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  prenom TEXT,
  poids DECIMAL(5,1),
  taille INTEGER,
  objectif_calories INTEGER DEFAULT 2400,
  objectif_proteines INTEGER,
  objectif_glucides INTEGER,
  objectif_lipides INTEGER,
  photo_url TEXT,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  groupe_musculaire TEXT NOT NULL,
  equipement TEXT,
  is_global BOOLEAN DEFAULT false
);

CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  jours TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.routine_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id UUID REFERENCES public.routines(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  ordre INTEGER NOT NULL,
  series_cible INTEGER DEFAULT 3,
  reps_cible INTEGER DEFAULT 10
);

CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  routine_id UUID REFERENCES public.routines(id),
  date DATE DEFAULT CURRENT_DATE,
  duree_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID REFERENCES public.workouts(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  ordre_exercice INTEGER,
  numero_serie INTEGER,
  poids DECIMAL(5,1),
  reps INTEGER,
  completed BOOLEAN DEFAULT false
);

CREATE TABLE public.aliments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  calories INTEGER NOT NULL,
  proteines DECIMAL(5,1),
  glucides DECIMAL(5,1),
  lipides DECIMAL(5,1),
  is_global BOOLEAN DEFAULT false
);

CREATE TABLE public.nutrition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  repas TEXT NOT NULL CHECK (repas IN ('petit-dejeuner', 'dejeuner', 'diner', 'snacks')),
  aliment_id UUID REFERENCES public.aliments(id) NOT NULL,
  quantite_g DECIMAL(6,1) NOT NULL
);

CREATE TABLE public.poids_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  poids DECIMAL(5,1) NOT NULL
);

-- ===== TRIGGER: AUTO-CREATE PROFILE =====

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== TRIGGER: AUTO-UPDATE updated_at =====

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ===== ROW LEVEL SECURITY =====

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aliments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poids_history ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- exercises (global accessible to all, personal only to owner)
CREATE POLICY "select_own_or_global" ON public.exercises FOR SELECT
  USING (is_global = true OR auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.exercises FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.exercises FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.exercises FOR DELETE
  USING (auth.uid() = user_id);

-- routines
CREATE POLICY "select_own" ON public.routines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.routines FOR DELETE USING (auth.uid() = user_id);

-- routine_exercises (via routine ownership)
CREATE POLICY "select_own" ON public.routine_exercises FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.user_id = auth.uid()));
CREATE POLICY "insert_own" ON public.routine_exercises FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.user_id = auth.uid()));
CREATE POLICY "update_own" ON public.routine_exercises FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.user_id = auth.uid()));
CREATE POLICY "delete_own" ON public.routine_exercises FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.routines r WHERE r.id = routine_id AND r.user_id = auth.uid()));

-- workouts
CREATE POLICY "select_own" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- workout_sets (via workout ownership)
CREATE POLICY "select_own" ON public.workout_sets FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "insert_own" ON public.workout_sets FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "update_own" ON public.workout_sets FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));
CREATE POLICY "delete_own" ON public.workout_sets FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));

-- aliments (global accessible to all, personal only to owner)
CREATE POLICY "select_own_or_global" ON public.aliments FOR SELECT
  USING (is_global = true OR auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.aliments FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.aliments FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.aliments FOR DELETE
  USING (auth.uid() = user_id);

-- nutrition_entries
CREATE POLICY "select_own" ON public.nutrition_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.nutrition_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.nutrition_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.nutrition_entries FOR DELETE USING (auth.uid() = user_id);

-- poids_history
CREATE POLICY "select_own" ON public.poids_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own" ON public.poids_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own" ON public.poids_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own" ON public.poids_history FOR DELETE USING (auth.uid() = user_id);
