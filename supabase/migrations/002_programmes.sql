-- ─────────────────────────────────────────
-- Migration 002 — Programmes d'entraînement
-- ─────────────────────────────────────────

-- Programmes
CREATE TABLE IF NOT EXISTS programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nom text NOT NULL,
  description text,
  difficulte text DEFAULT 'intermediaire', -- 'debutant' | 'intermediaire' | 'avance'
  duree_semaines int DEFAULT 8,
  jours int[] DEFAULT '{}', -- 0=Lundi, 1=Mardi, ..., 6=Dimanche
  created_at timestamptz DEFAULT now()
);

-- Routines associées à chaque jour d'un programme
CREATE TABLE IF NOT EXISTS programme_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programme_id uuid REFERENCES programmes(id) ON DELETE CASCADE NOT NULL,
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE NOT NULL,
  jour int NOT NULL -- 0=Lundi ... 6=Dimanche
);

-- Programme actif et date de démarrage sur le profil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS programme_actif_id uuid REFERENCES programmes(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS programme_actif_debut date;

-- RLS programmes
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "programmes_select_own" ON programmes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "programmes_insert_own" ON programmes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "programmes_update_own" ON programmes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "programmes_delete_own" ON programmes FOR DELETE USING (user_id = auth.uid());

-- RLS programme_routines
ALTER TABLE programme_routines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "prog_routines_select_own" ON programme_routines FOR SELECT
  USING (programme_id IN (SELECT id FROM programmes WHERE user_id = auth.uid()));
CREATE POLICY "prog_routines_insert_own" ON programme_routines FOR INSERT
  WITH CHECK (programme_id IN (SELECT id FROM programmes WHERE user_id = auth.uid()));
CREATE POLICY "prog_routines_update_own" ON programme_routines FOR UPDATE
  USING (programme_id IN (SELECT id FROM programmes WHERE user_id = auth.uid()));
CREATE POLICY "prog_routines_delete_own" ON programme_routines FOR DELETE
  USING (programme_id IN (SELECT id FROM programmes WHERE user_id = auth.uid()));
