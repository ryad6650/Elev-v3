# Élev v3 — Tracking Musculation & Nutrition (PWA)

App mobile-first de suivi de séances de musculation et nutrition (calories/macros). Utilisateur francophone, usage principal sur mobile.

## Stack (versions exactes)

- **Next.js 15** (App Router) / React 19 / TypeScript strict
- **Tailwind CSS v4** (pas v3 — syntaxe différente, pas de tailwind.config.js)
- **Supabase** (auth email/mot de passe, PostgreSQL, RLS obligatoire sur toutes les tables)
- **Zustand** pour le state management
- **@ducanh2912/next-pwa** pour la PWA (compatible Next.js 15)
- Hébergement Vercel

## Phase actuelle — Phase 3

MVP (Phase 2) terminé : onboarding, dashboard, workout, nutrition, poids, profil.
Phase 3 en cours : offline support, Service Worker, optimistic sync, feature calories/aliments.

## Design — Style "Élev" (Premium Sombre Chaleureux)

Accent orange doré `#E8860C` sur fond noir chaud `#0C0A09` + light mode crème `#FAF9F7`.
Typos : DM Serif Display italic (titres) + DM Sans (corps).
**→ Consulter le skill `design-system` pour toutes les règles détaillées.**

## Base de données

**→ Consulter le skill `supabase-patterns` pour le schéma complet, RLS, et patterns de requêtes.**

## Fonctionnalités

1. **Dashboard** : résumé jour (calories, macros, séance), streak, stats
2. **Workout** : routines, séries×reps×poids, timer repos, historique, auto-complétion
3. **Nutrition** : calories/macros/jour, 4 repas, aliments, recettes ratio cru/cuit
4. **Poids** : suivi corporel, graphique
5. **Profil** : objectifs, données perso, export

## Patterns Zustand

Toujours suivre cette structure pour un store :

```ts
interface WorkoutStore {
  // State
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;

  // Actions
  fetchSessions: () => Promise<void>;
  startSession: (routineId: string) => void;
  endSession: () => Promise<void>;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,

  fetchSessions: async () => {
    set({ isLoading: true });
    const { data } = await supabase.from("sessions").select("*");
    set({ sessions: data ?? [], isLoading: false });
  },
  // ...
}));
```

- Un store par domaine fonctionnel (workout, nutrition, weight, profile)
- Pas de store global fourre-tout
- Les actions async gèrent leur propre `isLoading`

## Patterns Supabase

**Server Component (fetch direct) :**

```ts
// app/dashboard/page.tsx
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) throw error
  return <Dashboard sessions={data} />
}
```

**Client Component (via store Zustand) :**

- Passer par le store, pas appeler Supabase directement depuis un composant
- Toujours gérer `error` et `loading`

**Mutations avec optimistic update :**

```ts
addSet: async (set) => {
  const tempId = crypto.randomUUID();
  // 1. Update optimiste immédiat
  set((state) => ({ sets: [...state.sets, { ...set, id: tempId }] }));
  // 2. Sync Supabase
  const { data, error } = await supabase
    .from("sets")
    .insert(set)
    .select()
    .single();
  if (error) {
    // 3. Rollback si erreur
    set((state) => ({ sets: state.sets.filter((s) => s.id !== tempId) }));
    return;
  }
  // 4. Remplacer tempId par vrai id
  set((state) => ({
    sets: state.sets.map((s) => (s.id === tempId ? data : s)),
  }));
};
```

## Conventions de Code

- **200 lignes MAX par fichier** — découper immédiatement si dépassé
- Texte utilisateur + commentaires en **français**
- TypeScript strict, **jamais de `any`**, un composant par fichier (PascalCase)
- Imports absolus `@/`, hooks préfixés `use`
- Tailwind v4 pour 90% du styling (attention : syntaxe v4, pas v3)
- Variables CSS dans `globals.css`
- RLS Supabase sur **TOUTES** les tables

## Ce qu'il ne faut JAMAIS faire

- `useEffect` pour fetcher des données → utiliser Server Components ou Zustand actions
- `any` en TypeScript
- Appeler Supabase directement depuis un composant client → passer par le store
- Inventer des couleurs hors palette
- Ajouter des dépendances npm sans accord
- Modifier `next.config.ts`, `vercel.json`, ou les fichiers env sans demander
- Migrations SQL destructives (DROP/DELETE/TRUNCATE) sans demander

## Organisation des Specs — specs/

- `specs/SPEC.md` → résumé global uniquement (40 lignes max)
- Un fichier par écran : `dashboard.md`, `workout.md`, `nutrition.md`, `poids.md`, `profil.md`, `database.md`
- Chaque fichier fait 100 lignes max
- **Ne lire que le fichier spec de l'écran sur lequel on travaille**

## Suivi de Progression — PROGRESS.md

**Après chaque tâche terminée**, mettre à jour `PROGRESS.md` :

- Ce qui vient d'être fait (fichiers créés/modifiés)
- Ce qui reste à faire
- Décisions techniques prises
- Bugs connus

**Au début de chaque session**, lire `PROGRESS.md` EN PREMIER.

## Mode Autonome (par défaut)

Agir directement sans demander confirmation. Pas de "tu veux que je continue ?".

**Demander avant :**

- Suppression de fichiers métier
- Migrations SQL destructives (DROP/DELETE/TRUNCATE)
- Modification auth/RLS critique
- Config déploiement (next.config.ts, vercel.json, env)
- Installation de nouvelles dépendances npm

## Règles Strictes

- `next/image` pour toutes les images
- TOUJOURS vérifier le rendu mobile après chaque modif UI
- TOUJOURS respecter la palette Élev
- Les fichiers temporaires/variantes peuvent être supprimés librement
