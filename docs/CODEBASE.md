# Codebase Élev v3 — Documentation

## Architecture générale

```
src/
├── app/
│   ├── (app)/              # Routes protégées (auth requise)
│   ├── (auth)/             # Routes publiques (login, register)
│   ├── api/                # API endpoints
│   ├── actions/            # Server actions (mutations)
│   └── onboarding/         # Flux onboarding
├── components/             # Composants React par feature
├── hooks/                  # Custom hooks
├── lib/                    # Utilitaires & services
├── store/                  # Stores Zustand
└── types/                  # Types TypeScript
```

## Pages & Routes

| Route            | Description                                    |
| ---------------- | ---------------------------------------------- |
| `/dashboard`     | Résumé jour (calories, macros, séance, streak) |
| `/nutrition`     | Suivi alimentaire par repas                    |
| `/workout`       | Séances d'entraînement & routines              |
| `/poids`         | Suivi poids & graphique                        |
| `/profil`        | Réglages, objectifs, préférences               |
| `/historique`    | Historique des séances                         |
| `/programmes`    | Programmes d'entraînement                      |
| `/rapport-hebdo` | Rapport hebdomadaire                           |

---

## Flux de données : Supabase -> Zustand -> UI

### 3 patterns principaux

**1. Server Component -> hydratation client (pattern principal)**

```
page.tsx (Server Component)
  -> fetchData(supabase) via lib/
  -> passe initialData au Client Component
  -> Client Component hydrate le store Zustand au mount
  -> UI lit le store via useStore((s) => s.xxx)
```

**2. Mutation client -> optimistic update -> Server Action**

```
User clique "Ajouter"
  -> store.addEntry() met à jour l'UI immédiatement (optimistic)
  -> appelle Server Action (addNutritionEntry)
  -> succès : remplace tempId par vrai ID
  -> erreur : rollback à l'état précédent
```

**3. Recherche client -> API Route -> externe**

```
User tape une recherche aliment
  -> fetch("/api/aliments?q=...")
  -> API cherche en local (RPC search_aliments)
  -> si < 8 résultats : fallback OpenFoodFacts
  -> retourne résultats fusionnés et dédupliqués
```

---

## Couche Supabase

| Fichier                          | Rôle                                            |
| -------------------------------- | ----------------------------------------------- |
| `src/lib/supabase/client.ts`     | Client navigateur (`createBrowserClient`)       |
| `src/lib/supabase/server.ts`     | Client serveur (`createServerClient` + cookies) |
| `src/lib/supabase/middleware.ts` | Auth middleware, injecte user dans headers      |
| `src/lib/supabase/user.ts`       | `getUserFromMiddleware()` — évite appel réseau  |
| `src/types/database.ts`          | Types auto-générés des tables                   |

### Tables principales

`profiles`, `aliments`, `nutrition_entries`, `exercises`, `routines`, `workouts`, `workout_sets`, `poids_history`, `sommeil`, `mensurations`, `user_aliment_favorites`

### Migrations

22 migrations dans `supabase/migrations/` couvrant : schéma initial, RPC dashboard, portions, favoris, recherche trigram, repas dynamiques, gradients.

---

## Stores Zustand

### nutritionStore (`src/store/nutritionStore.ts`)

- **State :** `entries`, `profile`, `date`, `isLoading`, `hasFetched`
- **Actions :** `fetchDay()`, `addEntry()`, `updateEntry()`, `removeEntry()`, `updateAlimentInEntries()`
- Pattern : optimistic updates avec rollback

### workoutStore (`src/store/workoutStore.ts`)

- **State :** `activeWorkout`, `isMinimized`, `restTimer`, `restDuration`
- **Actions :** `startWorkout()`, `addExercise()`, `addSet()`, `updateSet()`, `toggleComplete()`, `startRestTimer()`
- Persisté en localStorage (`elev-workout`), warmup sets auto-calculés

### uiStore (`src/store/uiStore.ts`)

- **State :** `fullscreenModal`
- Gère le flag modal plein écran global

---

## Fichiers liés à la Nutrition / Repas

### Utilitaires & types

| Fichier                      | Rôle                                                                                                                  |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/lib/nutrition-utils.ts` | Types (`NutritionEntry`, `Meal`, `NutritionProfile`) + fonctions pures (`calcNutrients`, `sumEntries`, `groupByMeal`) |
| `src/lib/nutrition.ts`       | `fetchNutritionData()` — fetch serveur des entries + profil                                                           |

### Server Actions (`src/app/actions/nutrition.ts`)

- `addNutritionEntry` — ajouter une entrée
- `deleteNutritionEntry` — supprimer une entrée
- `upsertExternalAliment` — sauvegarder aliment externe (OpenFoodFacts)
- `createCustomAliment` — créer aliment personnalisé
- `updateCustomAliment` — modifier aliment personnalisé
- `getRecentAliments` — 8 aliments récemment utilisés
- `getFavoriteAliments` — aliments favoris
- `toggleFavoriteAliment` — ajouter/retirer des favoris
- `getFavoriteIds` — IDs des favoris

### API Route (`src/app/api/aliments/route.ts`)

- `GET ?q=` — recherche texte (RPC trigram + OpenFoodFacts fallback)
- `GET ?barcode=` — scan code-barres
- Sans params — 24 aliments populaires globaux

### Composants (`src/components/nutrition/`)

| Composant              | Rôle                                    |
| ---------------------- | --------------------------------------- |
| `NutritionPageClient`  | Page principale, orchestre le store     |
| `NutritionHeader`      | Barre totaux vs objectifs               |
| `MealSection`          | Section repas (groupée par meal_number) |
| `FoodItem`             | Ligne d'un aliment dans un repas        |
| `AddFoodModal`         | Modal recherche + ajout aliment         |
| `FoodSearchStep`       | Étape input recherche                   |
| `FoodSearchResults`    | Affichage résultats recherche           |
| `FoodDetailSheet`      | Détails macros + sélecteur quantité     |
| `FoodViewSheet`        | Vue détail aliment                      |
| `EditEntryModal`       | Modifier quantité d'une entrée          |
| `CustomFoodForm`       | Créer un aliment personnalisé           |
| `BarcodeScanner`       | Scan code-barres caméra                 |
| `QuantityScrollPicker` | Sélecteur scroll pour grammage          |
| `FoodNutritionCard`    | Carte macros d'un aliment               |

---

## Server Actions (tous domaines)

| Fichier                         | Domaine                             |
| ------------------------------- | ----------------------------------- |
| `src/app/actions/nutrition.ts`  | CRUD entries, aliments, favoris     |
| `src/app/actions/workout.ts`    | Sauvegarder séances, refs exercices |
| `src/app/actions/routines.ts`   | CRUD routines, temps de repos       |
| `src/app/actions/exercises.ts`  | Fetch/créer exercices               |
| `src/app/actions/poids.ts`      | Entrées poids                       |
| `src/app/actions/profil.ts`     | Profil, préférences                 |
| `src/app/actions/historique.ts` | Historique séances                  |
| `src/app/actions/sommeil.ts`    | Suivi sommeil                       |
| `src/app/actions/streak.ts`     | Streaks connexion                   |
| `src/app/actions/programmes.ts` | Programmes                          |
