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
- `src/components/nutrition/FoodSearchResults.tsx` — liste de résultats de recherche cliquables
- `src/components/nutrition/AddFoodModal.tsx` — bottom sheet 3 étapes (recherche → quantité → ou aliment custom)
- `src/components/nutrition/NutritionPageClient.tsx` — hub client
- `src/app/(app)/nutrition/page.tsx` — page RSC (lit `?date=`)

Décisions techniques :
- Navigation date via URL `?date=YYYY-MM-DD` → RSC re-fetch (router.push côté client)
- Récents = derniers aliments distincts de `nutrition_entries` (server action, pas de state persisté)
- Aliments custom = `is_global: false`, user_id set → visibles uniquement par l'utilisateur
- RLS Supabase protège `nutrition_entries` et `aliments` user custom
- Pas d'API OpenFoodFacts (MVP) — DB locale uniquement

Bugs connus / Limitations MVP :
- Aliment custom ajouté avec 100g par défaut (pas de step quantité dans le flow custom)
- Pas d'édition d'une entrée (delete + re-add)
- Pas de duplication de repas d'un jour à l'autre

---

### Poids — Détail (fait le 2026-03-30)

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

Bugs connus / Limitations MVP :
- Pas de poids cible (objectif_poids absent du schéma profiles) — ligne pointillée non implémentée
- Pas de saisie offline (IndexedDB prévu en Phase 3)
- Pas de rappel matinal (notifications Phase 3)

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

## Historique — Détail (fait le 2026-03-30)

Fichiers créés :
- `src/lib/historique.ts` — fetch RSC (100 dernières séances + count total), calcul streak + PRs
- `src/app/(app)/historique/page.tsx` — page RSC
- `src/components/historique/HistoriqueStatsCards.tsx` — 3 cards (séances / volume / streak), réactif au filtre période
- `src/components/historique/HistoriqueVolumeChart.tsx` — bar chart SVG 8 semaines, bar pic mis en valeur avec tooltip
- `src/components/historique/PRSection.tsx` — top 3 records perso (fond ambré)
- `src/components/historique/HistoriqueList.tsx` — séances groupées par semaine avec dividers
- `src/components/historique/HistoriquePageClient.tsx` — hub client, pills période (7j/30j/3mois/Tout), filtre côté client

Décisions techniques :
- Filtre période côté client (pas de re-fetch) — données sur 100 séances suffisantes pour MVP
- PRs calculés côté serveur depuis les 100 dernières séances (max poids par exercice)
- Chart toujours sur 8 semaines glissantes (indépendant du filtre)
- Volume formaté en "k" au-dessus de 1000 kg

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
