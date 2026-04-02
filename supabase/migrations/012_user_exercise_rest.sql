-- Table pour sauvegarder le temps de repos par exercice par utilisateur
CREATE TABLE public.user_exercise_rest (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  rest_duration INTEGER NOT NULL, -- en secondes
  PRIMARY KEY (user_id, exercise_id)
);

-- RLS
ALTER TABLE public.user_exercise_rest ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lecture propre" ON public.user_exercise_rest
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insertion propre" ON public.user_exercise_rest
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Mise à jour propre" ON public.user_exercise_rest
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Suppression propre" ON public.user_exercise_rest
  FOR DELETE USING (auth.uid() = user_id);
