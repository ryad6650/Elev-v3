# Design System — Revolut x Fitness (Light Mode)

## Concept

Refonte visuelle d'Elev v3 inspiree du design system Revolut, adaptee au fitness.
Mode clair avec degradee vert sauge, typographie geometrique Inter, cards glass morphism, boutons pill.

## Palette de couleurs

### Fond & Surfaces
- **Degradee principal** (haut → bas) : `#dce8d8` → `#e4ead8` → `#ede8df` → `#f3f0ea`
- **Card** : `rgba(255,255,255,0.55)` + `backdrop-filter: blur(12px)` + `border: 1px solid rgba(255,255,255,0.35)`
- **Inner surface** (macros dans card) : `rgba(255,255,255,0.4)` + blur(8px)

### Texte
- **Primary** : `#1e1e1e`
- **Secondary** : `#5c5a57`
- **Muted** : `#908d88`

### Accents fitness
- **Vert (succes/CTA secondaire)** : `#2a9d6e` / dim: `rgba(42,157,110,0.10)`
- **Proteines** : `#3872c4` (bleu)
- **Glucides** : `#b08a1a` (jaune moutarde)
- **Lipides** : `#c94444` (rouge)

### Bouton CTA principal
- **Background** : `#dce8d8` (couleur du haut du degradee)
- **Texte/icone** : `#3a5a42`
- **Radius** : `9999px` (pill)
- **Padding** : `18px 32px`

## Typographie

- **Display/Titres** : Inter, weight 500, letter-spacing -0.5px
- **Body/UI** : DM Sans, weight 400-600
- **Pas de serif** — rupture avec le design actuel (DM Serif Display)

### Hierarchie (dimensions iPhone 14 Pro Max — 430x932)

| Role | Font | Size | Weight |
|------|------|------|--------|
| Titre page | Inter | 32-38px | 500 |
| Gros chiffre (calories) | Inter | 42px | 500 |
| Valeur macro (dashboard) | Inter | 22px | 600 |
| Valeur stat (poids/sommeil) | Inter | 28px | 600 |
| Ring pourcentage | Inter | 24px | 600 |
| Titre repas | Inter | 16px | 600 |
| Label section | Inter | 13px | 600 |
| Label macro | Inter | 10-11px | 700 |
| Date/eyebrow | Inter | 14px | 500 |
| Body/description | DM Sans | 12-14px | 400-500 |
| Nav labels | Inter | 11px | 500 |

## Composants

### Cards
- Radius : `20px`
- Glass morphism : semi-transparent + blur + border blanc subtil
- Zero ombres (flat Revolut)
- Padding : `24px` (grandes cards), `18-20px` (meal cards)

### Boutons
- **CTA pill** : 9999px radius, fond vert clair `#dce8d8`, texte `#3a5a42`
- **Fleches date** : 36px cercle, glass morphism
- **Ajouter aliment** : texte vert `#2a9d6e` + cercle `+` avec fond dim

### Progress
- **Ring SVG** : stroke vert `#2a9d6e`, stroke-linecap round, 96px
- **Barres macro** : 4-5px height, radius 99px, couleur par macro

### Week dots
- Taille : `32px`
- Done : fond vert `#2a9d6e` + check blanc
- Today : border `2px solid #1e1e1e`, fond transparent
- Futur : fond `rgba(0,0,0,0.06)`

### Dynamic Island
- `126x36px`, `background: #000`, `border-radius: 20px`
- Centree en haut, alignee avec heure et icones status

### Bottom nav
- 5 items : Seances, Poids, Accueil, Nutrition, Historique
- Icones SVG 26px, stroke 1.8
- Labels 11px Inter
- Active : `color: #1e1e1e` / Inactive : `color: #908d88`
- Border-top : `1px solid rgba(0,0,0,0.05)`

## Layout

- **Container** : max-width 430px (iPhone 14 Pro Max)
- **Content padding** : 28px horizontal
- **Spacing entre cards** : 12-16px
- **Ordre macros** : Glucides → Proteines → Lipides (partout)

## Animations

- **fadeIn** : translateY(8px) + opacity, 400ms ease-out, staggered 100ms
- **Barres macro** : width 0 → target, 700ms ease-out, delay 500-600ms
- **Ring** : stroke-dashoffset animation, 900ms ease-out, delay 500ms

## Pages validees

### Dashboard
1. Status bar + Dynamic Island
2. Header : date (uppercase) + "Bonjour, {prenom}" (38px)
3. Avatar cercle vert dim avec initiale
4. Card calories : ring 62% + chiffre 1240 / 2000 + "restantes" vert
5. 3 macros en grille (gluc/prot/lip) avec barres
6. Card streak semaine (7 dots)
7. 2 stat cards (poids + sommeil)
8. CTA "Demarrer une seance" (pill vert clair)
9. Bottom nav (Accueil actif)

### Nutrition
1. Status bar + Dynamic Island
2. Header : "Nutrition" (32px) + date picker (fleches pill)
3. Card calories : gros chiffre + barres macros (gluc/prot/lip)
4. Repas deplies : emoji + nom + kcal + chevron + split bar macros + legende + aliments avec accent couleur
5. Repas replies : emoji + nom + kcal + chevron
6. Bouton "+ Ajouter un aliment" vert
7. Bottom nav (Nutrition actif)

## Fichiers de reference

- Maquette combinee : `.superpowers/brainstorm/1766-1775724086/content/both-screens.html`
- Dashboard seul : `.superpowers/brainstorm/1766-1775724086/content/dashboard-revolut-gradient.html`
- Nutrition seule : `.superpowers/brainstorm/1766-1775724086/content/nutrition-revolut.html`
- Design system Revolut source : `awesome-design-md/DESIGN.md`
