# PROGRESS — Élev v3

## Phase 1 — Initialisation ✅

### Fait
- [x] Next.js 15 (App Router, TypeScript, Tailwind v4, ESLint, src/)
- [x] Dépendances installées : `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `@anthropic-ai/sdk`
- [x] Structure de dossiers complète (`(auth)`, `(app)`, `components/`, `lib/`, `types/`)
- [x] **Tailwind + CSS Variables** : dark mode par défaut, light mode via `[data-theme="light"]`, toutes les variables du design system
- [x] **Typographies** : DM Serif Display (titres) + DM Sans (corps) via `next/font/google`
- [x] **Supabase clients** : `client.ts` (browser), `server.ts` (RSC), `middleware.ts` (session refresh)
- [x] **Middleware Next.js** : protection des routes, redirect vers `/login` si non authentifié
- [x] **Auth pages** : login, register, forgot-password (email/MDP + Google OAuth)
- [x] **Auth callback** : `/auth/callback/route.ts` (échange code → session)
- [x] **Bottom navigation** : 5 onglets avec onglet actif en orange, icônes Lucide
- [x] **Types TypeScript** : `src/types/database.ts` (toutes les tables)
- [x] **Migration SQL** : `supabase/migrations/001_initial_schema.sql` (toutes les tables + RLS + triggers)
- [x] **Pages placeholder** : dashboard, workout, nutrition, poids, profil, onboarding

---

## Phase 2 — À faire (MVP)

- [x] Onboarding tunnel 5 étapes
- [x] Dashboard — résumé du jour + mini-stats
- [x] Workout — logging séances / exercices / séries
- [x] Nutrition — log aliments + macros
- [x] Poids — entrée + courbe
- [x] Profil — infos + paramètres

### Onboarding — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/app/onboarding/page.tsx` — RSC (redirect si déjà onboardé ou non auth)
- `src/app/actions/onboarding.ts` — Server Action saveOnboarding (update profiles + redirect /dashboard)
- `src/components/onboarding/OnboardingClient.tsx` — Machine d'état 5 étapes + barre de progression
- `src/components/onboarding/StepBienvenue.tsx` — Étape 1 : prénom (validation ≥2 chars)
- `src/components/onboarding/StepPhysique.tsx` — Étape 2 : taille + poids (optionnels)
- `src/components/onboarding/StepObjectif.tsx` — Étape 3 : 4 cards objectif (masse/perte/maintien/performance)
- `src/components/onboarding/StepNutrition.tsx` — Étape 4 : calories + macros (pré-calculés selon objectif+poids)
- `src/components/onboarding/StepPret.tsx` — Étape 5 : récapitulatif + save + redirect dashboard

Décisions techniques :
- Suggestions nutritionnelles calculées côté client (poids × multiplicateur selon objectif), modifiables par l'utilisateur
- Page RSC vérifie prenom en DB — si renseigné, redirect /dashboard (idempotent)
- Pas de layout (app) → pas de BottomNav pendant l'onboarding
- Flux : register → /auth/callback → /onboarding → /dashboard

---

### Workout — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/store/workoutStore.ts` — Zustand + persist localStorage (séance active, timer repos)
- `src/lib/workout.ts` — fetch RSC (routines + historique 5 dernières séances)
- `src/app/api/exercises/route.ts` — GET /api/exercises?q=&groupe=
- `src/app/actions/workout.ts` — Server Action saveWorkout (workouts + workout_sets)
- `src/components/workout/WorkoutPageClient.tsx` — Client wrapper (hub ↔ séance active)
- `src/components/workout/WorkoutHub.tsx` — Hub (CTA libre, programmes, historique)
- `src/components/workout/ActiveWorkout.tsx` — Séance active full-screen
- `src/components/workout/ExerciseCard.tsx` — Card exercice avec séries
- `src/components/workout/SetRow.tsx` — Ligne série (reps + poids + checkbox)
- `src/components/workout/RestTimer.tsx` — Timer repos overlay (anneau SVG)
- `src/components/workout/WorkoutTimer.tsx` — Chrono séance (mm:ss)
- `src/components/workout/ExerciseSearch.tsx` — Recherche exercices (filtres groupes)
- `src/components/workout/WorkoutSummary.tsx` — Récapitulatif fin + save Supabase
- `src/components/workout/WorkoutHistoryCard.tsx` — Card historique
- `src/types/database.ts` — Ajout `Relationships` (fix Supabase JS 2.100+ types)

Décisions techniques :
- State géré par Zustand + persist (localStorage) — séance survit au refresh
- Hydration guard (`useEffect` + `hydrated`) pour éviter flash SSR→client
- Pas d'IndexedDB (MVP) — localStorage suffit pour persister la séance en cours
- RestTimer déclenché auto après validation d'une série (toggleComplete)
- Séance libre : ouvre ExerciseSearch immédiatement
- Sauvegarde via Server Action (pas d'API route)

### Bibliothèque d'exercices — Enrichissement (fait le 2026-03-30)

Fichiers créés :
- `supabase/migrations/003_exercise_seed.sql` — ~110 exercices globaux : Pectoraux (13), Dos (16), Épaules (14), Biceps (12), Triceps (13), Abdominaux (12), Quadriceps (15), Ischio-jambiers (8), Fessiers (10), Mollets (6)
  - Équipements : Barre, Haltères, Machine, Poulie / Câble, Poids du corps, Corde, Kettlebell, Smith machine, Bande élastique

Fichiers modifiés :
- `src/app/api/exercises/route.ts` — limit 30 → 100 + filtre `?equipement=`
- `src/components/workout/ExerciseSearch.tsx` — debounce 300ms, filtre équipement (accordion avec badges colorés), badge équipement sur chaque résultat, compteur résultats

Décisions techniques :
- Debounce 300ms sur saisie texte (évite flood API)
- Filtre équipement en accordion (économise l'espace vertical)
- Badge coloré par équipement (9 couleurs distinctes) pour scan visuel rapide
- Filtre équipement transmis à l'API comme `?equipement=` (eq exact)

---

### Routines — Ajout (fait le 2026-03-30)

Fichiers créés :
- `src/components/workout/CreateRoutineModal.tsx` — plein écran : nom + liste exercices (stepper séries/reps) + ExerciseSearch intégré

Fichiers modifiés :
- `src/app/actions/workout.ts` — ajout `createRoutine`, `deleteRoutine`, `getRoutineExercises`
- `src/components/workout/ExerciseSearch.tsx` — prop `onSelect` optionnelle (retourne exercice sans l'ajouter au store)
- `src/components/workout/WorkoutPageClient.tsx` — le + ouvre un bottom sheet "Séance libre" / "Nouvelle routine"
- `src/components/workout/WorkoutHub.tsx` — bouton `...` sur chaque card → menu (Lancer / Supprimer) ; lancement avec exercices pré-chargés via `getRoutineExercises`
- `src/components/workout/RoutineCard.tsx` — prop `onOptions`, remplacement ChevronRight → MoreVertical

Décisions techniques :
- `getRoutineExercises` = server action (pas d'API route), appelée client-side avant `startWorkout`
- Lancement d'une routine pré-charge les exercices avec les séries/reps cibles définies
- Fallback si fetch échoue : lance la routine sans exercices pré-chargés

### Améliorations UI Workout (fait le 2026-03-30)

Fichiers modifiés :
- `src/components/workout/ActiveWorkout.tsx` — Header redesigné : ← + nom routine orange + "En cours..." italic serif + card timer (grand chrono + Pause + Fin)
- `src/components/workout/WorkoutTimer.tsx` — Props `pausedAt`, `totalPausedMs`, `large` pour affichage grand format et gestion pause locale
- `src/components/workout/RoutineCard.tsx` — Clic = accordion déroulant avec exercices + fourchette reps + bouton "Démarrer la séance" ; ChevronDown animé ; bordure orange si dépliée
- `src/components/workout/WorkoutHub.tsx` — Expand logic + cache exercices + "Modifier la routine" dans le menu `...`
- `src/app/actions/workout.ts` — Server Action `updateRoutine` (update nom + delete/re-insert routine_exercises)

Fichiers créés :
- `src/components/workout/EditRoutineModal.tsx` — Modal plein écran : pré-charge exercices via `getRoutineExercises`, édition nom/séries/reps, sauvegarde via `updateRoutine`

Décisions techniques :
- Pause = état local dans `ActiveWorkout` (non persisté) — suffisant MVP, évite de toucher le store
- Cache exercices dans `WorkoutHub` par routineId — évite refetch si l'utilisateur replie/déplie
- `EditRoutineModal` charge ses propres exercices via server action au montage

### Exercice personnalisé — Ajout (fait le 2026-03-30)

Fichiers créés :
- `src/components/workout/CreateExerciseModal.tsx` — Bottom sheet : nom + groupe musculaire (obligatoires) + équipement (optionnel) + server action + feedback loading/erreur

Fichiers modifiés :
- `src/app/actions/workout.ts` — ajout `createExercise` (insert avec `is_global: false`, `user_id` du user)
- `src/components/workout/ExerciseSearch.tsx` — bouton "Créer" dans le header + CTA "Créer" dans l'état vide (pré-remplit le nom si une recherche est en cours)

Décisions techniques :
- L'exercice créé est immédiatement ajouté à la séance (ou retourné via `onSelect`) sans re-fetch
- Visible uniquement par le créateur (RLS déjà en place via `is_global = false` + `user_id`)

### Fourchette de reps dans les routines (fait le 2026-03-30)

Fichiers créés :
- `supabase/migrations/004_reps_cible_max.sql` — colonne `reps_cible_max INTEGER` nullable sur `routine_exercises`

Fichiers modifiés :
- `src/types/database.ts` — ajout `reps_cible_max` dans Row/Insert de `routine_exercises`
- `src/store/workoutStore.ts` — ajout `repsCibleMax: number | null` dans `WorkoutSet` et `WorkoutExercise`, propagé dans `buildSets` et `addSet`
- `src/app/actions/workout.ts` — `getRoutineExercises` et `createRoutine` gèrent `repsCibleMax`
- `src/components/workout/CreateRoutineModal.tsx` — toggle "unique / fourchette" par exercice, deux steppers min/max en mode fourchette
- `src/components/workout/SetRow.tsx` — affiche "8-12" si fourchette, "×10" si unique
- `src/components/workout/ExerciseSearch.tsx` — `repsCibleMax: null` ajouté au défaut lors d'un ajout séance libre

Décisions techniques :
- `repsCibleMax: null` = chiffre unique (rétrocompatible)
- Toggle pill "unique / fourchette" par exercice, en haut à droite de la section reps
- Le min ne peut pas dépasser le max (auto-ajustement si nécessaire)
- Stepper max a `min = repsCible + 1` pour garantir fourchette valide

### Timer repos configurable par exercice (fait le 2026-03-30)

Fichiers modifiés :
- `src/store/workoutStore.ts` — `restDuration?: number | null` sur `WorkoutExercise` ; `toggleComplete` ne déclenche le timer que si `exercise.restDuration != null` ; ajout `setExerciseRestDuration`
- `src/components/workout/ExerciseCard.tsx` — bouton "Aucun minuteur / Xmin Xs" entre le nom et les headers ; ouvre `RestDurationPicker`

Fichiers créés :
- `src/components/workout/RestDurationPicker.tsx` — bottom sheet avec 8 options (Aucun, 30s, 45s, 1min, 1min30, 2min, 3min, 5min)

Décisions techniques :
- Défaut = `undefined` (pas de minuteur) — plus d'auto-démarrage au premier usage
- Personnalisable par exercice, persisté dans le store Zustand (localStorage)
- Bouton orange si timer actif, gris sinon

Bugs connus / Limitations MVP :
- Pas de pré-remplissage "valeurs dernière séance" (poidsRef = null)
- Pas de détection PR automatique
- Pas de notifications sonores/vibration timer repos
- ~~Pas d'édition de routine~~ → EditRoutineModal implémenté (2026-03-30)

---

### Nutrition — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/lib/nutrition.ts` — fetch RSC (entries + profil), utils `calcNutrients` / `sumEntries`
- `src/app/api/aliments/route.ts` — GET /api/aliments?q= (recherche globaux + custom user)
- `src/app/actions/nutrition.ts` — Server Actions : addNutritionEntry, deleteNutritionEntry, createCustomAliment, getRecentAliments
- `src/components/nutrition/NutritionHeader.tsx` — navigation date (← Aujourd'hui →) + CaloriesRing + barres macros
- `src/components/nutrition/MealSection.tsx` — section repas (petit-déj / déjeuner / dîner / collations)
- `src/components/nutrition/FoodItem.tsx` — ligne aliment avec calories calculées + delete
- `src/components/nutrition/FoodSearchResults.tsx` — liste résultats (cards avec avatar monogramme, pills macros colorées P/G/L, bouton +)
- `src/components/nutrition/FoodSearchStep.tsx` — étape recherche V3 (barre search + scan orange, tabs Résultats/Récents/Favoris, chips catégories filtrantes)
- `src/components/nutrition/AddFoodModal.tsx` — bottom sheet (utilise FoodSearchStep + FoodDetailSheet + CustomFoodForm), header avec sous-titre repas/date
- `src/components/nutrition/NutritionPageClient.tsx` — hub client
- `src/app/(app)/nutrition/page.tsx` — page RSC (lit `?date=`)

Décisions techniques :
- Navigation date via URL `?date=YYYY-MM-DD` → RSC re-fetch (router.push côté client)
- Récents = derniers aliments distincts de `nutrition_entries` (server action, pas de state persisté)
- Aliments custom = `is_global: false`, user_id set → visibles uniquement par l'utilisateur
- RLS Supabase protège `nutrition_entries` et `aliments` user custom
- Pas d'API OpenFoodFacts (MVP) — DB locale uniquement

### Fiche produit V2 + refactor modale recherche (fait le 2026-03-31)

Fichiers créés :
- `src/components/nutrition/FoodDetailSheet.tsx` — fiche produit plein écran (anneau calories SVG, breakdown P/G/L/Fibres, barre macros proportionnelle, 3 cards macros, tableau nutritionnel détaillé, stepper quantité +/- 10g avec preview macros en temps réel, bouton favori local)
- `src/components/nutrition/CustomFoodForm.tsx` — formulaire création aliment personnalisé (extrait de AddFoodModal pour respecter limite 200 lignes)
- `mockups/recherche-v1.html` / `recherche-v2.html` / `recherche-v3.html` — maquettes HTML de la recherche
- `mockups/produit-v1.html` / `produit-v2.html` — maquettes HTML de la fiche produit

Fichiers modifiés :
- `src/components/nutrition/AddFoodModal.tsx` — step 'quantity' remplacé par `<FoodDetailSheet>`, formulaire custom extrait dans `CustomFoodForm`, `handleConfirm` accepte qty en paramètre

Décisions techniques :
- FoodDetailSheet intégré dans le même bottom sheet (pas de navigation, juste swap de contenu)
- Bouton favori = état local uniquement (pas de table DB favoris au MVP)
- Anneau SVG purement décoratif (toujours plein) — affiche les kcal/100g au centre
- Barre macros proportionnelle aux calories (P×4, G×4, L×9)
- Stepper par paliers de 10g (min 1g)

### Portions + Édition aliments (fait le 2026-03-31)

Fichiers créés :
- `supabase/migrations/008_portion.sql` — colonnes `portion_nom` + `taille_portion_g` sur la table aliments

Fichiers modifiés :
- `src/types/database.ts` — colonnes portion dans aliments Row/Insert
- `src/lib/nutrition-utils.ts` — champs `is_global`, `portion_nom`, `taille_portion_g` dans NutritionAliment
- `src/app/api/aliments/route.ts` — SELECT_COLS inclut is_global + colonnes portion
- `src/app/actions/nutrition.ts` — createCustomAliment accepte portion, ajout updateCustomAliment, getRecentAliments inclut colonnes portion
- `src/components/nutrition/CustomFoodForm.tsx` — champs portion (toggle affichage) + mode édition (editAliment prop + onEdited callback)
- `src/components/nutrition/FoodDetailSheet.tsx` — bouton Modifier (crayon, si is_global===false), toggle Grammes/Portion en bas, quantité par défaut = portion si définie
- `src/components/nutrition/AddFoodModal.tsx` — step 'edit' → CustomFoodForm en mode édition, handleEdited met à jour selected et retourne à la fiche

Décisions techniques :
- is_global===false = aliment custom éditable (global et OFT = lecture seule)
- Mode portion par défaut si taille_portion_g défini, grammes sinon — toggle pill pour switcher
- Stepper en mode portion = pas de taille_portion_g (min = 1 portion)
- Après édition : setSelected(updated) + retour step 'quantity' + router.refresh()

Bugs connus / Limitations MVP :
- Aliment custom ajouté avec 100g par défaut (pas de step quantité dans le flow custom)
- Pas d'édition d'une entrée (delete + re-add)
- Pas de duplication de repas d'un jour à l'autre
- Favoris non persistés (état local, pas de table DB)

---

### Base de données aliments 50k + OpenFoodFacts (fait le 2026-03-30)

Fichiers créés :
- `supabase/migrations/006_aliments_enrichi.sql` — Ajout colonnes marque/code_barres/fibres/sucres/sel + extension pg_trgm + index GIN trigram sur nom + index code_barres
- `scripts/seed-aliments-off.mjs` — Script Node.js ESM pour importer ~50k produits français depuis OpenFoodFacts (trié par unique_scans_n)

Fichiers modifiés :
- `src/lib/nutrition-utils.ts` — NutritionAliment étendu : marque, fibres, sucres, sel, code_barres, source ('local'|'openfoodfacts')
- `src/types/database.ts` — Table aliments mise à jour (7 nouvelles colonnes)
- `src/app/api/aliments/route.ts` — Recherche parallèle DB locale + OFT, déduplication par code_barres/nom
- `src/app/actions/nutrition.ts` — Ajout upsertExternalAliment (sauvegarde résultat OFT avant log), update getRecentAliments (nouvelles colonnes)
- `src/components/nutrition/FoodSearchResults.tsx` — Affichage marque + badge "OFT" pour résultats externes
- `src/components/nutrition/AddFoodModal.tsx` — handleConfirm gère résultats OFT (id='') → upsertExternalAliment avant addNutritionEntry

Décisions techniques :
- OpenFoodFacts = base externe (gratuit, millions de produits, pas d'auth)
- Seed script : 100 pages × 500 = 50k produits, triés par popularité France, insérés en batches de 100
- Parallélisme : `Promise.all([local, searchOFF(q)])` avec timeout 3s sur OFT
- OFT results id='' → upsertExternalAliment vérifie code_barres avant insert (évite doublons)
- Seed script reprend là où il s'est arrêté avec `--start-page=N`

Usage seed :
```bash
SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-aliments-off.mjs
# Options : --pages=100 --start-page=1 --dry-run
```

---

### Poids — Redesign v2 (fait le 2026-03-30)

Fichiers créés :
- `src/lib/poids.ts` — fetch RSC (historique trié par date + taille du profil)
- `src/app/actions/poids.ts` — Server Actions : upsertPoids (insert ou update par date), deletePoids
- `src/components/poids/PoidsChart.tsx` — Graphique SVG avec sélecteur de période (7j/30j/3m/6m/Tout), points réels + ligne de tendance (moyenne mobile 7 pts), aire dégradée
- `src/components/poids/PoidsStats.tsx` — 4 stats : poids actuel, variation 7j, variation 30j, min/max
- `src/components/poids/PoidsIMC.tsx` — Calcul IMC + catégorie OMS (affiché neutrement)
- `src/components/poids/AddPoidsModal.tsx` — Bottom sheet : saisie date + poids, modification possible
- `src/components/poids/PoidsHistorique.tsx` — Liste chronologique inverse, modifier + supprimer
- `src/components/poids/PoidsPageClient.tsx` — Hub client, état modal
- `src/app/(app)/poids/page.tsx` — Page RSC

Décisions techniques :
- Upsert en 2 étapes (check + insert/update) pour garantir une seule entrée par jour
- Moyenne mobile calculée par fenêtre glissante (7 pts par index, pas par date) — correct pour données quasi-quotidiennes
- SVG pur, pas de lib externe — cohérent avec le reste du projet
- IMC affiché seulement si taille renseignée dans le profil
- revalidatePath sur /dashboard aussi pour mettre à jour le mini-graphique

Fichiers créés :
- `supabase/migrations/005_mensurations.sql` — table mensurations (cou, tour_taille, poitrine, hanches, bras, cuisse, mollet) + RLS
- `src/components/poids/PoidsHero.tsx` — grand affichage poids + delta + saisie inline + bouton Enregistrer
- `src/components/poids/PoidsComposition.tsx` — IMC + barre gradient + masse grasse Navy (si mensurations renseignées)
- `src/components/poids/MensurationsCard.tsx` — grille 2 col éditable, sauvegarde via server action

Fichiers modifiés :
- `src/components/poids/PoidsChart.tsx` — pills v2 style (coral-dim actif), périodes 7j/30j/3m/1an
- `src/components/poids/PoidsPageClient.tsx` — nouveau layout : hero → chart → composition → mensurations → historique
- `src/lib/poids.ts` — fetch mensurations en parallèle
- `src/app/actions/poids.ts` — ajout saveMensurations (upsert sur user_id)

Décisions :
- Saisie du poids inline (hero card) — plus de bouton "Peser" header
- PoidsStats et PoidsIMC remplacés par PoidsHero et PoidsComposition
- Masse grasse calculée via formule Navy si cou + tour_taille renseignés
- MensurationsCard : mode lecture / mode édition (toggle bouton "Modifier" → "Sauvegarder")

Bugs connus / Limitations MVP :
- Pas de poids cible (objectif_poids absent du schéma profiles)
- Formule Navy (masse grasse) = version hommes uniquement (pas de genre en DB)
- Mensurations = 1 ligne par utilisateur (pas d'historique des mensurations)

---

### Dashboard — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/lib/dashboard.ts` — fetch server-side (7 queries Supabase en parallèle)
- `src/components/dashboard/CaloriesRing.tsx` — SVG animé calories
- `src/components/dashboard/MacrosBars.tsx` — barres protéines/glucides/lipides
- `src/components/dashboard/QuickActions.tsx` — 3 boutons rapides (Séance, Repas, Poids)
- `src/components/dashboard/StreakCard.tsx` — streak + objectifs hebdo
- `src/components/dashboard/InsightCard.tsx` — insight passif calculé
- `src/components/dashboard/WeightMiniChart.tsx` — courbe SVG poids 30j
- `src/app/(app)/dashboard/page.tsx` — page RSC complète

Décisions techniques :
- Page = RSC (Server Component), toutes les données fetchées server-side
- Animations SVG = Client Components (CaloriesRing)
- Pas de lib de charts externe — SVG pur
- Insight IA = passif calculé côté serveur (pas d'appel Anthropic au chargement)
- État vide géré par try/catch → `DashboardEmpty`

### Profil — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/lib/profil.ts` — fetch RSC (profil + stats globales : total séances, séances ce mois, streak)
- `src/app/actions/profil.ts` — Server Actions : updateInfosProfil, updateObjectifsNutrition, updateTheme, updatePassword
- `src/components/profil/ProfilHeader.tsx` — avatar (initiale ou photo), prénom, email, membre depuis
- `src/components/profil/ProfilStats.tsx` — 3 cards : séances totales, séances ce mois, streak actuel
- `src/components/profil/ProfilInfosForm.tsx` — formulaire prénom + taille avec save
- `src/components/profil/ProfilObjectifsForm.tsx` — formulaire calories + macros (grille 2 col)
- `src/components/profil/ProfilPreferences.tsx` — toggle thème clair/sombre (persiste en DB + applique immédiatement)
- `src/components/profil/ProfilCompte.tsx` — accordion MDP + déconnexion avec confirmation
- `src/components/profil/ProfilPageClient.tsx` — assemblage client
- `src/app/(app)/profil/page.tsx` — page RSC

Décisions techniques :
- Changement de thème appliqué immédiatement via `document.documentElement.setAttribute("data-theme", ...)` + persisté en DB
- Vérification du mot de passe actuel via re-signIn Supabase (pas d'API admin)
- Déconnexion côté client (createBrowserClient signOut) + redirect via router.push
- Stats calculées server-side : streak par fenêtre glissante sur les 60 dernières séances

Bugs connus / Limitations MVP :
- Upload photo de profil non implémenté (Supabase Storage, Phase 3)
- Pas de suppression de compte (Phase 3)
- Pas d'export CSV/PDF (Phase 3)
- Champs supplémentaires (sexe, DDN, objectif fitness, notifications) non en DB — affichés "prochainement"

---

## Phase 2 (suite) — Programmes (fait le 2026-03-30)

Fichiers créés :
- `supabase/migrations/002_programmes.sql` — tables `programmes` + `programme_routines` + colonnes `programme_actif_id` / `programme_actif_debut` sur `profiles` + RLS complet
- `src/types/database.ts` — ajout types `programmes`, `programme_routines`, nouvelles colonnes `profiles`
- `src/lib/programmes.ts` — `fetchProgrammesData()` : RSC, requêtes parallèles, calcul progression
- `src/app/actions/programmes.ts` — Server Actions : `createProgramme`, `activerProgramme`, `desactiverProgramme`, `deleteProgramme`
- `src/components/programmes/SemaineVisuelle.tsx` — 7 cercles jours (statique + interactif)
- `src/components/programmes/ProgrammeActifCard.tsx` — card CTA orange + barre progression
- `src/components/programmes/ProgrammeCard.tsx` — card liste avec tags difficulté + meta
- `src/components/programmes/ProgrammeDetail.tsx` — bottom sheet détail (planning, routines, CTA activer/supprimer)
- `src/components/programmes/CreateProgrammeModal.tsx` — bottom sheet 3 étapes (infos → jours → routines par jour)
- `src/components/programmes/ProgrammesPageClient.tsx` — hub client (filtres pills, état vide)
- `src/app/(app)/programmes/page.tsx` — page RSC remplacée (était placeholder)

Décisions techniques :
- Progression calculée côté serveur depuis `programme_actif_debut` (floor(diffDays / 7) + 1)
- Filtres pills : matching par mots-clés dans nom+description (PPL, Full Body, Upper/Lower, Force)
- Cascade SQL : suppression programme → suppression programme_routines automatique
- `desactiverProgramme` revalidate /dashboard aussi (pour widget futur)

---

## Historique — Redesign v2 (fait le 2026-03-30)

Fichiers créés :
- `src/components/historique/HistoriqueCalendar.tsx` — calendrier mensuel avec navigation, dots séances, highlight aujourd'hui, streak

Fichiers modifiés :
- `src/components/historique/HistoriqueStatsCards.tsx` — 3 chips avec barre colorée gauche (coral/amber/blue), style v2
- `src/components/historique/PRSection.tsx` — grille 2 colonnes, poids en or (#D4A843), trophy emoji
- `src/components/historique/HistoriqueList.tsx` — session cards style v2 (barre accent gauche, chips ⏱/🏋/📦)
- `src/components/historique/HistoriquePageClient.tsx` — suppression pills période, ajout calendrier, layout v2

Décisions :
- Pills période supprimées (non présentes dans la maquette v2)
- Volume stats = all-time (totalSeances + all workouts volume)
- Calendrier navigable mois par mois côté client

Décisions techniques :
- Filtre période côté client (pas de re-fetch) — données sur 100 séances suffisantes pour MVP
- PRs calculés côté serveur depuis les 100 dernières séances (max poids par exercice)
- Chart toujours sur 8 semaines glissantes (indépendant du filtre)
- Volume formaté en "k" au-dessus de 1000 kg

---

### Sommeil — Saisie depuis le dashboard (fait le 2026-03-30)

Fichiers créés :
- `supabase/migrations/007_sommeil.sql` — table `sommeil` (user_id, date, duree_minutes, UNIQUE user+date) + RLS
- `src/app/actions/sommeil.ts` — Server Actions : saveSommeil (upsert), deleteSommeil
- `src/components/dashboard/SleepModal.tsx` — bottom sheet avec steppers heures (0-12) + minutes (0/15/30/45)
- `src/components/dashboard/SleepMiniStat.tsx` — mini stat cliquable, affiche la durée en "7h30", bordure orange si renseigné

Fichiers modifiés :
- `src/lib/dashboard.ts` — ajout `sommeilMinutes` dans DashboardData + fetch parallèle depuis table sommeil
- `src/app/(app)/dashboard/page.tsx` — remplacement MiniStat sommeil statique par SleepMiniStat
- `src/types/database.ts` — ajout type table `sommeil`

Décisions techniques :
- Upsert sur conflit (user_id, date) — 1 seule entrée par jour
- Minutes par pas de 15 (0, 15, 30, 45) — cohérent avec granularité montre connectée
- Valeur affichée : "7h30", "8h", "6h45" selon les minutes
- Bordure orange sur la mini stat si le sommeil est renseigné (feedback visuel)
- État local dans SleepMiniStat — mise à jour sans re-render RSC via onSaved callback

---

### GIFs animés exercices — ExerciseDB (fait le 2026-03-31)

Fichiers créés :
- `supabase/migrations/010_exercise_gif_urls.sql` — ALTER TABLE gif_url + UPDATE 110 exercices existants + INSERT 84 nouveaux exercices avec GIFs
- `src/components/workout/ExerciseGif.tsx` — Composant GIF animé (3 tailles sm/md/lg, fallback icône Dumbbell)

Fichiers modifiés :
- `src/types/database.ts` — ajout `gif_url: string | null` dans exercises Row/Insert
- `src/store/workoutStore.ts` — ajout `gifUrl?: string | null` dans WorkoutExercise
- `src/app/api/exercises/route.ts` — SELECT inclut gif_url
- `src/app/actions/workout.ts` — RoutineExerciseData inclut gifUrl, createExercise retourne gif_url, getRoutineExercises sélectionne gif_url
- `src/components/workout/ExerciseSearch.tsx` — GIF dans chaque résultat de recherche + groupe "Avant-bras" ajouté
- `src/components/workout/ExerciseCard.tsx` — GIF dans vue condensée et vue ouverte (remplace badge numéro)
- `src/components/workout/RoutineCard.tsx` — GIF dans liste dépliante des exercices + couleurs ischio-jambiers/avant-bras
- `src/components/workout/CreateExerciseModal.tsx` — gif_url dans interface Exercise + groupe "Avant-bras"

Décisions techniques :
- Source : ExerciseDB open source (AGPL-3.0), 1500 exercices avec GIFs anatomiques animés
- GIFs hébergés sur CDN ExerciseDB (static.exercisedb.dev/media/{id}.gif) — pas d'auto-hébergement
- `<img>` natif (pas next/image) — next/image ne gère pas bien les GIFs animés
- Fallback = icône Dumbbell si gif_url null ou erreur de chargement
- 84 nouveaux exercices ajoutés (total ~194) + nouveau groupe "Avant-bras" (7 exercices)
- Mapping français→anglais fait manuellement pour les 110 exercices existants

---

## Phase 3 — Fonctionnalités avancées

- [x] Offline / Service Worker / sync optimiste
- [ ] IA — suggestions charges + assistant chat
- [ ] Notifications push
- [ ] Export CSV / PDF
- [x] PWA manifest + icônes

---

### Offline / Service Worker — Détail (fait le 2026-03-30)

Fichiers créés :
- `public/manifest.json` — PWA manifest (name, icons, shortcuts, display standalone)
- `public/sw.js` — Service Worker : cache-first (assets Next.js hachés), stale-while-revalidate (pages), network-first (API), page offline HTML
- `src/lib/offlineQueue.ts` — File d'attente IndexedDB : enqueue/getAll/remove/count pour 6 types d'opérations
- `src/hooks/useOnlineStatus.ts` — Hook navigator.onLine avec events online/offline
- `src/hooks/useSyncQueue.ts` — Rejoue la file d'attente sur reconnexion + écoute messages SW (Background Sync)
- `src/hooks/useOfflineAction.ts` — Wrapper mutation : online→action directe, offline→enqueue + requestBackgroundSync
- `src/components/ServiceWorkerRegistration.tsx` — Enregistre /sw.js, écoute updatefound pour auto-activation
- `src/components/layout/OfflineBanner.tsx` — Bannière fixe top : "Mode hors ligne" (amber) → "Synchronisation en cours" (orange) au retour

Fichiers modifiés :
- `src/app/layout.tsx` — Ajout `<ServiceWorkerRegistration />`
- `src/app/(app)/layout.tsx` — Ajout `<OfflineBanner />`

Décisions techniques :
- SW custom (pas de next-pwa) pour éviter dépendance npm supplémentaire
- IndexedDB via API native (pas de lib idb) — léger, 0 dépendance
- Background Sync API en best-effort (non dispo sur Safari) — fallback sur event `online`
- Server Actions rejoués depuis le client via dynamic import — fonctionnent comme RPC HTTP POST
- Icônes PNG (192×512) à créer dans `public/icons/` pour compléter le PWA manifest

Limitations :
- Pas d'UI optimiste immédiate (les mutations queued ne s'affichent pas avant sync) — accepté MVP
- Safari ne supporte pas Background Sync → replay uniquement via event `online`

---

### PWA Manifest + Icônes — Détail (fait le 2026-03-30)

Fichiers créés :
- `public/icons/icon-192.png` — Icône 192×192 (fond sombre + cercle orange + "É" blanc)
- `public/icons/icon-512.png` — Icône 512×512
- `public/icons/apple-touch-icon.png` — Icône 180×180 pour iOS
- `scripts/generate-icons.js` — Générateur PNG sans dépendance (Node.js + zlib built-in)

Fichiers modifiés :
- `public/manifest.json` — Séparation `purpose: "any"` et `purpose: "maskable"` (bonne pratique)
- `src/app/layout.tsx` — Ajout `icons.apple` pour balise `<link rel="apple-touch-icon">`

---

## Stack

| Outil | Version |
|---|---|
| Next.js | 15.x |
| React | 19.x |
| Tailwind | v4 |
| Supabase JS | latest |
| Supabase SSR | latest |
| Lucide React | latest |
| Anthropic SDK | latest |

## Variables d'environnement requises

Copier `.env.local.example` → `.env.local` et renseigner :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`

## Base de données

Lancer la migration dans le tableau de bord Supabase (SQL Editor) :
```
supabase/migrations/001_initial_schema.sql
```
