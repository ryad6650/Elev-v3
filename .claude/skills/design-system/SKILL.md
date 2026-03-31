---
name: design-system
description: Design system complet d'Élev v3. Utiliser ce skill CHAQUE FOIS qu'on crée ou modifie un composant UI, une page, un écran, un élément visuel, ou qu'on travaille sur le style, les couleurs, la typographie, les animations, ou le responsive. Utiliser aussi quand on corrige un problème d'apparence ou de cohérence visuelle.
---

# Design System — Élev v3

## Palette de couleurs

### Dark mode (défaut)
| Variable | Valeur | Usage |
|----------|--------|-------|
| --bg-primary | #0C0A09 | Fond principal |
| --bg-secondary | #1C1917 | Fond cards/sections |
| --bg-card | #292524 | Cards surélevées |
| --bg-elevated | #44403C | Inputs, éléments actifs |
| --text-primary | #FAFAF9 | Texte principal |
| --text-secondary | #A8A29E | Texte secondaire |
| --text-muted | #78716C | Labels, placeholders |
| --border | rgba(255,255,255,0.08) | Bordures subtiles |

### Light mode
| Variable | Valeur | Usage |
|----------|--------|-------|
| --bg-primary | #FAF9F7 | Fond principal crème |
| --bg-secondary | #F0EEEB | Fond cards |
| --bg-card | #FFFFFF | Cards surélevées |
| --bg-elevated | #E7E5E4 | Inputs, éléments actifs |
| --text-primary | #1C1917 | Texte principal |
| --text-secondary | #78716C | Texte secondaire |
| --text-muted | #A8A29E | Labels, placeholders |
| --border | #E7E5E4 | Bordures |

### Accent & sémantique (identiques dark/light)
| Variable | Valeur | Usage |
|----------|--------|-------|
| --accent | #E8860C | Orange doré — boutons, CTA |
| --accent-hover | #CA6F08 | Hover boutons |
| --accent-bg | rgba(232,134,12,0.15) | Fond card accent |
| --accent-text | #FDBA74 (dark) / #C2410C (light) | Chiffres accentués |
| --color-protein | #3B82F6 | Bleu protéines |
| --color-carbs | #EAB308 | Jaune glucides |
| --color-fat | #EF4444 | Rouge lipides |
| --success | #22C55E | Validations |
| --danger | #EF4444 | Suppressions |

## Typographies
- **Titres (prénom, noms de pages)** : `DM Serif Display` italic
- **Labels de section** : `DM Sans` weight 600, MAJUSCULES, letter-spacing: 0.05em
- **Corps de texte** : `DM Sans` weight 400
- **Chiffres clés (calories, poids, reps)** : `DM Sans` weight 700, taille 2x-3x le corps, couleur --accent-text
- Charger via `next/font/google`

## Composants standards

### Cards
- Background : --bg-secondary
- Border-radius : rounded-2xl (16px)
- Border : 1px solid --border
- Padding : p-4 (16px) ou p-5 (20px)
- Pas de box-shadow en dark, ombre douce en light

### Card CTA (Prochain entraînement)
- Background : gradient via classe `.workout-next-card`
  - Dark : `linear-gradient(135deg, #1a0e07 0%, #2d1506 40%, #C8622E 100%)`
  - Light : `linear-gradient(135deg, #7c3d08 0%, #a8520f 40%, #E8860C 100%)`
- Texte : blanc
- Icône flèche à droite
- Border-radius : rounded-2xl

### Boutons
- **Primaire** : bg --accent, texte blanc, rounded-xl (12px), py-3.5 px-4, text-sm font-semibold
- **Primaire full-width** : w-full, rounded-2xl (16px), py-4
- **Secondaire** : bg transparent, border 1px --border, texte --text-primary, rounded-xl
- **Pill** : rounded-full, px-3.5 py-1.5, text-xs font-semibold (tabs, filtres)
- **Icône** : p-1.5 à p-2, rounded-xl
- **Tap feedback** : active:scale-95 ou active:scale-[0.98] (pas de hover — mobile-first)
- **Disabled** : opacity-40 ou opacity-60, bg --bg-elevated, text --text-muted
- Transition : transition-all 200ms

### Inputs
- Background : --bg-elevated
- Border : 1px solid --border
- Border-radius : rounded-xl (12px)
- Padding : px-4 py-3
- Font-size : 16px (obligatoire — empêche le zoom iOS)
- Focus : border 1.5px solid --accent, box-shadow 0 0 0 3px var(--accent-bg)
- Outline : none

### Bottom Navigation
- 5 onglets avec emojis : 💪 Séances, ⚖️ Poids, 🏠 Accueil, 🥗 Nutrition, 📊 Historique
- **Container** : rounded-[32px], backdrop-blur(16px), bg color-mix(--bg-secondary 90%, transparent), border 1px --border, box-shadow 0 8px 32px rgba(0,0,0,0.4)
- **Onglet actif** : bg --accent, rounded-[22px], texte blanc
- **Onglets inactifs** : emoji + label en --text-muted
- Position : fixed bottom, z-index élevé

### Bottom Sheet Modals
- Position : fixed bottom 0
- Border-radius : rounded-t-3xl (haut) ou rounded-3xl (flottant)
- Background : --bg-secondary ou --bg-card
- Max-height : calc(100dvh - padding)
- Overlay : rgba(0,0,0,0.45) à rgba(0,0,0,0.65)
- Handle bar en haut (indicateur de drag)

### Tabs / Pill Buttons
- rounded-full
- Actif : bg --accent, texte blanc
- Inactif : bg --bg-elevated, texte --text-secondary
- px-3.5 py-1.5, text-xs font-semibold

### Badges / Chips
- Petit : px-2 py-0.5, rounded-md, text-[11px] font-semibold
- Couleur de fond contextuelle (difficulté, groupe musculaire)

### Sélection radio-like
- Border inactive : 1px solid --border
- Border active : 1.5px solid --accent
- Background active : --accent-bg

### Toggle Switch
- rounded-full
- Indicateur translate(30px) ou translate(4px)
- Background actif : --accent

### Barres de macros
- Height : 6px
- Border-radius : rounded-full
- Background track : --bg-elevated
- Couleurs fill : --color-protein / --color-carbs / --color-fat
- Animation : width transition 700ms ease

### Anneaux de progression (calories)
- SVG circle, stroke --accent pour la progression
- Stroke-linecap round
- Animation au chargement (dash-offset transition 1s ease)
- Chiffre centré à l'intérieur (gros, --text-primary)

### Mini-stats (dashboard)
- 3 cards en row, taille égale
- Emoji en haut (💪⚖️📈), chiffre en gros, label en petit
- Background : --bg-secondary
- Border-radius : rounded-2xl

### Expandable Cards
- ChevronDown rotate 180° quand expanded
- Section expanded séparée par border-top
- Transition : rotate 200ms

### Banners
- ActiveWorkoutBanner : fixed au-dessus de la bottom nav
- backdrop-blur, border --accent
- box-shadow : 0 4px 24px rgba(232,134,12,0.15)

## Shadows
| Contexte | Valeur |
|----------|--------|
| Bottom nav | 0 8px 32px rgba(0,0,0,0.4) |
| Modal | 0 16px 48px rgba(0,0,0,0.5) |
| Banner accent | 0 4px 24px rgba(232,134,12,0.15) |
| Bouton accent | 0 4px 20px rgba(232,134,12,0.3) |
| Petit élément | 0 1px 3px rgba(0,0,0,0.3) |

## Espacement
Toujours utiliser des multiples de 4px : 4, 8, 12, 16, 20, 24, 32, 48, 64

## Responsive
- Mobile first : 375px par défaut, max-w-[430px] centré
- Breakpoints Tailwind : sm (640px), md (768px), lg (1024px)
- La bottom nav n'apparaît que sur mobile (< md)
- Sur desktop : sidebar navigation à gauche
- Padding bottom : pb-20 pour compenser la bottom nav
- Safe area : env(safe-area-inset-top, 20px)

## Animations
- Entrée de page : fade-in + translateY(10px), durée 300ms, ease-out (classe `.page-enter`)
- Tap boutons : active:scale-95 ou active:scale-[0.98]
- Toggle dark/light : transition colors 300ms (via `.theme-transitioning`)
- Barres de progression : width transition 700ms ease
- Scan barcode : animation 2s ease-in-out infinite
- Pas d'animations lourdes ou excessives

## Évolution du skill

**Ce skill doit évoluer au fil des conversations.** Mets à jour `## Apprentissages` quand :

- L'utilisateur ajuste une couleur, espacement, ou composant et exprime une préférence claire
- Un nouveau pattern UI récurrent émerge dans le projet
- L'utilisateur dit "utilise toujours X pour Y" ou corrige un choix visuel

Pour mettre à jour : utilise Edit sur `C:/Users/louis/elev-v3/.claude/skills/design-system/SKILL.md`. Format : `- [date courte] [observation]`.

## Apprentissages

- [2026-03-31] Mise à jour complète : aligné le skill avec le code réel (bottom nav emojis, boutons active:scale, card CTA gradient, inputs focus, bottom sheets, tabs, badges, shadows, banners)
