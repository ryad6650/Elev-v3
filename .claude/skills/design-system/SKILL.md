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
- Border-radius : 16-20px
- Border : 1px solid --border
- Padding : 20-24px
- Pas de box-shadow en dark, ombre douce en light

### Card CTA (Prochain entraînement)
- Background : --accent (orange plein)
- Texte : blanc
- Icône flèche à droite
- Border-radius : 16px

### Boutons
- Primaire : bg --accent, texte blanc, border-radius 12px, padding 12px 24px
- Secondaire : bg transparent, border 1px --border, texte --text-primary
- Hover : scale(1.02) + --accent-hover
- Transition : 200ms ease

### Inputs
- Background : --bg-elevated
- Border : 1px solid --border
- Border-radius : 10px
- Padding : 12px 16px
- Focus : border --accent

### Bottom Navigation
- 5 onglets : Séance, Poids, Accueil, Nutrition, Historique
- Onglet actif : fond --accent arrondi (pill 25px), texte blanc
- Onglets inactifs : icône + label en --text-muted
- Icônes : Lucide React
- Position : fixed bottom, background blur --bg-primary

### Mini-stats (dashboard)
- 3 cards en row, taille égale
- Emoji en haut (💪⚖️📈), chiffre en gros, label en petit
- Background : --bg-secondary
- Border-radius : 16px

### Anneaux de progression (calories)
- SVG circle, stroke --accent pour la progression
- Stroke-linecap round
- Animation au chargement (dash-offset transition 1s ease)
- Chiffre centré à l'intérieur (gros, --text-primary)

### Barres de macros
- Height : 6px
- Border-radius : 3px (full rounded)
- Background track : --bg-elevated
- Couleurs fill : --color-protein / --color-carbs / --color-fat
- Animation : width transition 0.5s ease

## Espacement
Toujours utiliser des multiples de 4px : 4, 8, 12, 16, 20, 24, 32, 48, 64

## Responsive
- Mobile first : 375px par défaut
- Breakpoints Tailwind : sm (640px), md (768px), lg (1024px)
- La bottom nav n'apparaît que sur mobile (< md)
- Sur desktop : sidebar navigation à gauche

## Animations
- Entrée de page : fade-in + translateY(10px), durée 300ms, ease-out
- Hover boutons : scale(1.02), 200ms
- Toggle dark/light : transition colors 300ms
- Pas d'animations lourdes ou excessives
