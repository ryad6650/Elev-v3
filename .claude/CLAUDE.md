# Elev v3 — Tracking Musculation & Nutrition (PWA)

App mobile-first de suivi de musculation et nutrition. Utilisateur francophone, usage principal sur mobile.

## Stack technique

- **Next.js 16.2.1** (App Router) / **React 19.2.4** / TypeScript strict
- **Tailwind CSS v4** (pas de tailwind.config — config via `@theme inline` dans globals.css)
- **Supabase** (auth email/mdp + Google OAuth, PostgreSQL, RLS sur toutes les tables)
- **Zustand 5** pour le state management (3 stores : workout, nutrition, ui)
- **lucide-react** pour les icones
- **html2canvas** pour export rapport hebdo en image
- **Husky + lint-staged + Prettier** pour pre-commit (eslint --fix + prettier + tsc --noEmit)
- Hebergement Vercel
- PWA manuelle (sw.js dans public/, pas de lib next-pwa)

## Structure des dossiers

```
src/
  app/
    (auth)/          login/, register/, forgot-password/ + layout.tsx
    (app)/           routes protegees + layout.tsx, loading.tsx, error.tsx
      dashboard/     page.tsx, loading.tsx, error.tsx
      nutrition/     page.tsx, loading.tsx
      workout/       page.tsx, loading.tsx
      poids/         page.tsx, loading.tsx
      historique/    page.tsx, loading.tsx
      profil/        page.tsx, loading.tsx
      programmes/    page.tsx
      rapport-hebdo/ page.tsx
    api/
      aliments/      route.ts (recherche aliments Supabase + OpenFoodFacts)
      exercises/     route.ts + upload-image/route.ts
    actions/         Server Actions (11 fichiers)
    auth/callback/   route.ts (OAuth callback)
    onboarding/      page.tsx
    layout.tsx       Root layout (fonts, metadata, viewport)
    globals.css      Design system CSS variables + animations
  components/
    auth/  dashboard/  historique/  layout/  nutrition/
    onboarding/  poids/  profil/  programmes/
    rapport-hebdo/  workout/  ui/
  hooks/             4 hooks (useOfflineAction, useOnlineStatus, useRoutineExercises, useSyncQueue)
  lib/
    supabase/        client.ts, server.ts, middleware.ts, user.ts
    dashboard.ts     nutrition.ts  nutrition-utils.ts  workout.ts
    historique.ts    poids.ts  profil.ts  programmes.ts
    weekly-report.ts date-utils.ts  accent-compute.ts  apply-accent.ts
    offlineQueue.ts
  store/             nutritionStore.ts, workoutStore.ts, uiStore.ts
  types/             database.ts (types auto-gen Supabase)
supabase/
  migrations/        23 fichiers SQL (001 a 023)
  config.toml
```

## Schema Supabase (15 tables)

| Table                      | Cle                       | Description                                                                                                                                        |
| -------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **profiles**               | id (=auth.users)          | prenom, poids, taille, objectifs calories/macros, theme, accent_color, accent_secondary, gradient_intensity, streak_connexions, programme_actif_id |
| **exercises**              | id                        | nom, groupe_musculaire, equipement, is_global, gif_url, user_id                                                                                    |
| **routines**               | id                        | user_id, nom, jours[]                                                                                                                              |
| **routine_exercises**      | id                        | routine_id, exercise_id, ordre, series_cible, reps_cible, reps_cible_max                                                                           |
| **workouts**               | id                        | user_id, routine_id, date, duree_minutes, notes                                                                                                    |
| **workout_sets**           | id                        | workout_id, exercise_id, ordre_exercice, numero_serie, poids, reps, completed, is_warmup                                                           |
| **aliments**               | id                        | nom, calories, proteines, glucides, lipides, fibres, sucres, sel, marque, code_barres, portion_nom, taille_portion_g, is_global, user_id           |
| **nutrition_entries**      | id                        | user_id, date, meal_number (1-4), meal_time, aliment_id, quantite_g, quantite_portion                                                              |
| **poids_history**          | id                        | user_id, date, poids                                                                                                                               |
| **mensurations**           | id                        | user_id (UNIQUE), cou, tour_taille, poitrine, hanches, bras, cuisse, mollet                                                                        |
| **sommeil**                | id                        | user_id, date (UNIQUE par user), duree_minutes (1-720)                                                                                             |
| **programmes**             | id                        | user_id, nom, description, difficulte, duree_semaines, jours[]                                                                                     |
| **programme_routines**     | id                        | programme_id, routine_id, jour                                                                                                                     |
| **user_exercise_rest**     | (user_id, exercise_id) PK | rest_duration (secondes), notes                                                                                                                    |
| **user_aliment_favorites** | id                        | user_id, aliment_id (UNIQUE pair)                                                                                                                  |

**RPCs :** `search_aliments` (recherche fuzzy pg_trgm), `get_dashboard_data` (dashboard en 1 requete)
**Extensions :** uuid-ossp, pg_trgm
**Triggers :** handle_new_user (auto-cree profile), handle_updated_at (profiles)
**RLS :** Toutes les tables — pattern `auth.uid() = user_id` + global visible pour exercises/aliments

## Stores Zustand

**workoutStore** (persiste localStorage) : activeWorkout, isMinimized, restTimer, restDuration. Actions : startWorkout, addExercise, removeExercise, replaceExercise, addSet, removeSet, updateSet, toggleComplete, addWarmupSets, rest timer, clearWorkout.

**nutritionStore** : entries[], profile (objectifs), date, isLoading. Actions : fetchDay, addEntry, updateEntry, removeEntry (tous avec optimistic update + rollback).

**uiStore** : fullscreenModal (controle visibilite BottomNav).

## Hooks custom

- **useOnlineStatus** : detecte online/offline via events
- **useOfflineAction** : wrappe les Server Actions, queue dans IndexedDB si offline
- **useSyncQueue** : rejoue la queue IndexedDB quand online revient
- **useRoutineExercises** : gere l'edition locale de la liste exercices d'une routine

## Server Actions (src/app/actions/)

exercises, historique, nutrition, onboarding, poids, profil, programmes, routines, sommeil, streak, workout

## API Routes

- `GET /api/aliments?q=&code=` — recherche aliments (Supabase + OpenFoodFacts, cache 60s)
- `GET /api/exercises?q=&group=&equipment=` — recherche exercices
- `POST /api/exercises/upload-image` — upload GIF vers Supabase Storage

## Design system (globals.css)

**Dark mode (defaut) :** bg #0c0a09 / #1c1917 / #292524, texte #fafaf9 / #a8a29e / #78716c
**Light mode** (`[data-theme="light"]`) : bg #faf9f7 / #f0eeeb / #ffffff, texte #1c1917 / #78716c
**Macros :** proteines #3b82f6, glucides #eab308, lipides #ef4444
**Accent :** dynamique par utilisateur (stocke dans profiles.accent_color), applique via JS (apply-accent.ts)
**Typos :** DM Serif Display (titres, `--font-display`), DM Sans (corps, `--font-sans`)
**Tailwind v4 :** config via `@theme inline {}` dans globals.css, pas de fichier tailwind.config
**Gradients :** variables CSS --grad-workout, --grad-btn-accent, --grad-sleep, --grad-header-line, recalculees dynamiquement selon accent choisi
**Container mobile :** max-width 430px centre

## Patterns a suivre

### Server Components pour le fetch

```ts
// Toutes les pages sont des Server Components qui fetchent via lib/
export default async function Page() {
  const supabase = await createServerClient()
  const data = await fetchDashboardData(supabase)
  return <PageClient data={data} />
}
```

### Zustand — un store par domaine

```ts
export const useWorkoutStore = create<WorkoutStore>()(
  persist((set, get) => ({ ... }), { name: 'workout-store' })
)
```

- Actions async gerent leur propre isLoading
- Optimistic updates avec rollback sur erreur
- Jamais appeler Supabase directement depuis un composant client

### Mutations via Server Actions

```ts
// src/app/actions/nutrition.ts
"use server"
export async function addNutritionEntry(...) {
  const supabase = await createServerClient()
  // ... insert + revalidatePath
}
```

### Optimistic updates (nutritionStore pattern)

1. Update local immediat avec tempId
2. Appel Supabase
3. Rollback si erreur, remplace tempId si succes

## Conventions de code

- **200 lignes MAX par fichier** — decouper immediatement si depasse
- Texte utilisateur + commentaires en **francais**
- TypeScript strict, **jamais de `any`**
- Un composant par fichier (PascalCase)
- Imports absolus `@/`
- Hooks prefixes `use`
- Tailwind v4 pour 90% du styling
- Variables CSS dans globals.css

## Ce qu'il ne faut JAMAIS faire

- `useEffect` pour fetcher des donnees → Server Components ou Zustand actions
- `any` en TypeScript
- Appeler Supabase directement depuis un composant client → passer par le store
- Inventer des couleurs hors palette
- Ajouter des dependances npm sans accord
- Modifier `next.config.ts`, `vercel.json`, ou les fichiers env sans demander
- Migrations SQL destructives (DROP/DELETE/TRUNCATE) sans demander
- Utiliser tailwind.config.js (n'existe pas, Tailwind v4 utilise @theme inline)

## Scripts npm

- `dev` : next dev --webpack
- `build` : next build
- `start` : next start
- `lint` : eslint
- `typecheck` : tsc --noEmit

## Pre-commit hooks (Husky)

lint-staged : eslint --fix + prettier --write sur \*.{ts,tsx}, puis tsc --noEmit

## Organisation des specs — specs/

- `specs/SPEC.md` → resume global (40 lignes max)
- Un fichier par ecran : dashboard.md, workout.md, nutrition.md, poids.md, profil.md, database.md
- 100 lignes max par fichier
- Ne lire que le fichier spec de l'ecran sur lequel on travaille

## Suivi de progression — PROGRESS.md

Apres chaque tache terminee, mettre a jour PROGRESS.md. Au debut de chaque session, lire PROGRESS.md EN PREMIER.

## Mode autonome (par defaut)

Agir directement sans demander confirmation.

**Demander avant :**

- Suppression de fichiers metier
- Migrations SQL destructives
- Modification auth/RLS critique
- Config deploiement (next.config.ts, vercel.json, env)
- Installation de nouvelles dependances npm

## Workflow Superpowers (obligatoire)

Avant chaque tâche :

- Bug → systematic-debugging avant de toucher au code
- Feature → brainstorming puis plan d'implémentation
- Refactoring → plan avant de modifier
- Ne jamais coder directement sans avoir planifié

Au début de chaque session : lire PROGRESS.md puis CLAUDE.md.

## Bugs connus à corriger

- Refresh nutrition tab intermittent après modification/ajout d'un repas — parfois se met à jour, parfois non. Probable race condition entre optimistic update Zustand et revalidatePath.
- Aliment trouvé via Open Food Facts : impossible à ajouter, chargement infini à la sélection
- Création d'un nouvel aliment personnalisé : bug lors de la soumission du formulaire
