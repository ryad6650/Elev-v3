---
name: supabase-patterns
description: Patterns Supabase pour Élev v3. Utiliser ce skill CHAQUE FOIS qu'on crée ou modifie une table, une migration, une politique RLS, une requête Supabase, ou qu'on travaille sur l'authentification, le stockage de données utilisateur, ou la structure de la base de données.
---

# Supabase Patterns — Élev v3

## Authentification
- Email + mot de passe uniquement (pas de magic link, pas d'OAuth)
- Pages : inscription, connexion, mot de passe oublié
- Après inscription → créer automatiquement une ligne dans `profiles` via trigger SQL
- Session gérée côté client avec `@supabase/auth-helpers-nextjs`

## Structure des tables

### profiles (lié à auth.users)
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
prenom TEXT NOT NULL
poids DECIMAL(5,1)         -- en kg
taille INTEGER              -- en cm
objectif_calories INTEGER DEFAULT 2400
objectif_proteines INTEGER  -- en g
objectif_glucides INTEGER   -- en g
objectif_lipides INTEGER    -- en g
photo_url TEXT
theme TEXT DEFAULT 'dark'   -- 'dark' ou 'light'
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

### exercises (base partagée + custom utilisateur)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id)  -- NULL = exercice global
nom TEXT NOT NULL
groupe_musculaire TEXT NOT NULL        -- ex: 'pectoraux', 'dos', 'jambes'
equipement TEXT                        -- ex: 'barre', 'haltères', 'machine'
is_global BOOLEAN DEFAULT false
```

### routines
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) NOT NULL
nom TEXT NOT NULL
jours TEXT[]                           -- ex: ['lundi', 'mercredi', 'vendredi']
created_at TIMESTAMPTZ DEFAULT now()
```

### routine_exercises
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
routine_id UUID REFERENCES routines(id) ON DELETE CASCADE
exercise_id UUID REFERENCES exercises(id)
ordre INTEGER NOT NULL
series_cible INTEGER DEFAULT 3
reps_cible INTEGER DEFAULT 10
```

### workouts (séances effectuées)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) NOT NULL
routine_id UUID REFERENCES routines(id)
date DATE DEFAULT CURRENT_DATE
duree_minutes INTEGER
notes TEXT
created_at TIMESTAMPTZ DEFAULT now()
```

### workout_sets (séries effectuées)
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE
exercise_id UUID REFERENCES exercises(id)
ordre_exercice INTEGER
numero_serie INTEGER
poids DECIMAL(5,1)          -- en kg
reps INTEGER
completed BOOLEAN DEFAULT false
```

### aliments
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id)  -- NULL = aliment global
nom TEXT NOT NULL
calories INTEGER NOT NULL   -- pour 100g
proteines DECIMAL(5,1)
glucides DECIMAL(5,1)
lipides DECIMAL(5,1)
is_global BOOLEAN DEFAULT false
```

### nutrition_entries
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) NOT NULL
date DATE DEFAULT CURRENT_DATE
repas TEXT NOT NULL          -- 'petit-dejeuner', 'dejeuner', 'diner', 'snacks'
aliment_id UUID REFERENCES aliments(id)
quantite_g DECIMAL(6,1)     -- quantité en grammes
```

### poids_history
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id UUID REFERENCES profiles(id) NOT NULL
date DATE DEFAULT CURRENT_DATE
poids DECIMAL(5,1) NOT NULL
```

## RLS — Règles obligatoires
CHAQUE table avec un `user_id` doit avoir ces policies :
```sql
-- Lecture : uniquement ses propres données
CREATE POLICY "select_own" ON [table] FOR SELECT
  USING (auth.uid() = user_id);

-- Insertion : uniquement pour soi-même
CREATE POLICY "insert_own" ON [table] FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Modification : uniquement ses propres données
CREATE POLICY "update_own" ON [table] FOR UPDATE
  USING (auth.uid() = user_id);

-- Suppression : uniquement ses propres données
CREATE POLICY "delete_own" ON [table] FOR DELETE
  USING (auth.uid() = user_id);
```

Pour les tables avec `is_global` (exercises, aliments) : autoriser le SELECT pour tout le monde sur les lignes globales.

## Trigger auto-création profil
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Patterns de requêtes
- Toujours utiliser le client typé : `supabase.from('table').select()`
- Toujours vérifier les erreurs : `const { data, error } = await ...`
- Jointures via `.select('*, exercise:exercises(*)')` — pas de requêtes multiples
- Filtrer par date : `.eq('date', dateString)` au format 'YYYY-MM-DD'
- Trier l'historique : `.order('date', { ascending: false })`
