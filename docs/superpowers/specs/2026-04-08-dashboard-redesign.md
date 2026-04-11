# Dashboard Redesign — Accueil Wellness

## Contexte

Le dashboard actuel est surchargé (calories, macros, séances semaine, routine, sommeil) avec un style dark glassmorphisme qui ne correspond plus à la direction wellness/zen de l'app. L'utilisateur veut un écran d'accueil chaleureux, épuré et professionnel — pas un tableau de bord.

## Philosophie

Accueil minimaliste style app wellness premium. Peu d'informations, beaucoup d'espace, typographie élégante, tons chauds. L'écran dit "bienvenue" plutôt que "voici tes stats".

## Structure

Layout centré verticalement dans le viewport (flexbox `justify-center`, `min-height: 100dvh`). Container max-width 430px. Bottom padding pour la nav.

### Greeting (bloc centré)

1. **Date** : uppercase, petite taille (12px), DM Sans, couleur muted `#78716c`, letter-spacing 0.5px
   - Format : `MARDI 8 AVRIL`

2. **Salutation** : DM Serif Display, 36-40px, couleur brune `#4a3728`
   - Ligne 1 : `Bonjour,`
   - Ligne 2 : `{prénom}` (récupéré depuis profiles.prenom)

3. **Message contextuel** : DM Sans, 16px, couleur muted `#78716c`, margin-top 8px
   - 5h-12h : "Prêt pour une belle journée ?"
   - 12h-17h : "Comment avance ta journée ?"
   - 17h-22h : "Belle journée derrière toi"
   - 22h-5h : "Encore debout ?"

4. **Bouton profil** : cercle 36px en haut à droite (position absolute), photo de profil ou initiale sur fond `#e8dcc8`. Lien vers `/profil`.

### Card Calories

Positionnée sous le greeting, margin-top 32px.

- **Fond** : `#ffffff` (ou `#faf9f7`)
- **Bordure** : `1px solid rgba(74, 55, 40, 0.12)`
- **Border-radius** : 16px
- **Padding** : 20-24px

Contenu :
- **Label** : "Calories aujourd'hui" — 11px uppercase, letter-spacing 0.5px, muted `#78716c`
- **Nombre** : `{consommées}` en DM Serif 28px brun `#4a3728` + `/ {objectif} kcal` en DM Sans 14px muted
- **Barre** : hauteur 6px, border-radius 999px
  - Fond : `rgba(74, 55, 40, 0.1)`
  - Remplissage : gradient `#c4a882 → #a0785c` (terracotta doux)
  - Animation : remplit de 0% à la valeur sur 800ms, ease-out

## Animations d'entrée

Chaque élément apparaît en séquence (staggered) :
1. Date — delay 0ms, fade-in + translateY(12px → 0), 400ms ease-out
2. Salutation — delay 100ms
3. Message — delay 200ms
4. Card calories — delay 300ms

## Ce qui est retiré

- Image de fond gym (`bg-gym2.png`)
- Context-dark / glassmorphisme
- MacrosCard (macros visibles uniquement sur /nutrition)
- WeeklyWorkoutCard (séances semaine)
- SeancesWeekCard
- SleepCard / SleepModal (sommeil déplacé — à définir où plus tard)
- Couleur accent vive (#74BF7A vert)
- Tous les gradients dark (--grad-workout, --grad-btn-accent, etc.)

## Palette du dashboard

| Token | Valeur | Usage |
|-------|--------|-------|
| Fond principal | `#f2e8d5` | Background page (--bg-primary existant) |
| Fond card | `#ffffff` | Card calories |
| Bordure card | `rgba(74,55,40,0.12)` | Bordure fine brune |
| Texte principal | `#4a3728` | Titres, nombres |
| Texte muted | `#78716c` | Labels, date, message |
| Barre fond | `rgba(74,55,40,0.1)` | Track de la barre |
| Barre remplie | `#c4a882 → #a0785c` | Gradient terracotta |
| Profil bg | `#e8dcc8` | Cercle avatar fallback |

## Thème

Toujours light/crème. Pas de variante dark pour le dashboard. La classe `context-dark` n'est plus appliquée.

## Données nécessaires (inchangé)

Le RPC `get_dashboard_data` reste utilisé mais on ne consomme que :
- `prenom`, `photoUrl`
- `caloriesConsommees`, `objectifCalories`
- `accentColor`, `theme` (pour le reste de l'app, pas le dashboard)

## Fichiers à modifier

- `src/components/dashboard/DashboardPageClient.tsx` — refonte complète
- `src/components/dashboard/CaloriesCard.tsx` — redesign avec nouvelle palette
- `src/app/(app)/dashboard/page.tsx` — simplifier les données passées
- `src/app/globals.css` — ajouter animation staggered, éventuellement tokens

## Fichiers à supprimer (potentiellement)

- `MacrosCard.tsx`, `SeancesWeekCard.tsx`, `WeeklyWorkoutCard.tsx` — plus utilisés
- `SleepCard.tsx`, `SleepMiniStat.tsx`, `SleepModal.tsx` — déplacés ailleurs
- `CaloriesRing.tsx`, `MacrosBars.tsx` — alternatives non utilisées

Note : vérifier qu'aucun autre composant n'importe ces fichiers avant suppression.

## Vérification

1. Ouvrir `/dashboard` sur mobile (ou DevTools 430px)
2. Vérifier : fond crème, greeting centré, message contextuel correct selon l'heure
3. Vérifier : card calories avec barre animée, nombres corrects
4. Vérifier : animations d'entrée staggered fluides
5. Vérifier : bouton profil fonctionnel
6. Vérifier : pas de flash dark au chargement
7. Tester avec 0 calories (barre vide) et > objectif (barre pleine, pas de débordement)
