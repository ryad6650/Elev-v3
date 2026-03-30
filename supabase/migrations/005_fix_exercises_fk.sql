-- Fix FK exercises.user_id : pointe vers auth.users au lieu de public.profiles
-- Le trigger handle_new_user peut échouer silencieusement → FK sur profiles bloque l'insert

ALTER TABLE public.exercises
  DROP CONSTRAINT exercises_user_id_fkey;

ALTER TABLE public.exercises
  ADD CONSTRAINT exercises_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
