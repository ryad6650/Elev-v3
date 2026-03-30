-- Table sommeil : 1 entrée par user par jour
CREATE TABLE sommeil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  duree_minutes INTEGER NOT NULL CHECK (duree_minutes > 0 AND duree_minutes <= 720),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE sommeil ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sommeil"
  ON sommeil
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
