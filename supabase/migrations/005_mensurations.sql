-- Mensurations corporelles (1 ligne par utilisateur, upsert)
CREATE TABLE IF NOT EXISTS mensurations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cou         NUMERIC(5,1),
  tour_taille NUMERIC(5,1),
  poitrine    NUMERIC(5,1),
  hanches     NUMERIC(5,1),
  bras        NUMERIC(5,1),
  cuisse      NUMERIC(5,1),
  mollet      NUMERIC(5,1),
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

ALTER TABLE mensurations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mensurations_own" ON mensurations
  FOR ALL USING (auth.uid() = user_id);
