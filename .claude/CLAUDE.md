\# Élev v3 — Tracking Musculation \& Nutrition (PWA)



App mobile-first de suivi de séances de musculation et nutrition (calories/macros). Utilisateur francophone, usage principal sur mobile.



\## Stack

\- Next.js 14+ (App Router) / React 18+ / TypeScript strict

\- Tailwind CSS 3+ avec variables CSS custom

\- Supabase (auth email/mot de passe, PostgreSQL, RLS obligatoire sur toutes les tables)

\- Zustand pour le state management

\- PWA via next-pwa / Hébergement Vercel



\## Design — Style "Élev" (Premium Sombre Chaleureux)

Accent orange doré (#E8860C) sur fond noir chaud (#0C0A09) + light mode crème (#FAF9F7).

Typos : DM Serif Display italic (titres) + DM Sans (corps).

\*\*→ Consulter le skill `design-system` pour toutes les règles détaillées (couleurs, composants, animations).\*\*



\## Base de données

\*\*→ Consulter le skill `supabase-patterns` pour le schéma complet des tables, le RLS, et les patterns de requêtes.\*\*



\## Fonctionnalités

1\. \*\*Dashboard\*\* : résumé jour (calories, macros, séance), streak, stats

2\. \*\*Workout\*\* : routines, séries×reps×poids, timer repos, historique, auto-complétion

3\. \*\*Nutrition\*\* : calories/macros/jour, 4 repas, aliments, recettes ratio cru/cuit

4\. \*\*Poids\*\* : suivi corporel, graphique

5\. \*\*Profil\*\* : objectifs, données perso, export



\## Conventions de Code

\- \*\*200 lignes MAX par fichier\*\* — découper immédiatement si dépassé

\- Texte utilisateur + commentaires en français

\- TypeScript strict, jamais de `any`, un composant par fichier (PascalCase)

\- Imports absolus `@/`, hooks préfixés `use`

\- Tailwind 90% du styling, variables CSS dans globals.css

\- RLS Supabase sur TOUTES les tables, auth email/mot de passe



\## Organisation des Specs — specs/

Les spécifications sont découpées en petits fichiers par domaine dans `specs/` :

\- `specs/SPEC.md` → résumé global uniquement (40 lignes max)

\- Un fichier par écran : `dashboard.md`, `workout.md`, `nutrition.md`, `poids.md`, `profil.md`, `database.md`

\- Chaque fichier fait 100 lignes max

\- \*\*Ne lire que le fichier spec de l'écran sur lequel on travaille\*\*, pas tous les fichiers.



\## Suivi de Progression — PROGRESS.md

\*\*Après chaque tâche terminée\*\*, mettre à jour `PROGRESS.md` à la racine avec :

\- Ce qui vient d'être fait (fichiers créés/modifiés)

\- Ce qui reste à faire

\- Décisions techniques prises

\- Bugs connus



\*\*Au début de chaque session\*\*, lire `PROGRESS.md` EN PREMIER — pas besoin de re-scanner tout le projet. Cela économise du contexte et des tokens.



\## Mode Autonome (par défaut)

Claude agit directement sans demander confirmation. Pas de "tu veux que je continue ?", pas de "je peux faire X ?". Juste faire.

Exceptions (demander avant) : suppression de fichiers métier, migrations SQL destructives (DROP/DELETE/TRUNCATE), modification auth/RLS critique, config déploiement (next.config, vercel.json, env).

\## Règles Strictes

\- Demander avant de supprimer des fichiers métier (les fichiers temporaires/variantes peuvent être supprimés librement)

\- TOUJOURS vérifier le rendu mobile après chaque modif UI

\- TOUJOURS respecter la palette — pas d'improvisation

\- Pas de dépendances npm sans accord

\- `next/image` pour toutes les images



