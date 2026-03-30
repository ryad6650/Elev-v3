# Dashboard — Spécifications

## Vue principale
Écran d'accueil affiché à l'ouverture de l'app. Résumé journalier de tous les modules.

## Sections du dashboard

### 1. Résumé du jour
- **Calories** : consommées / objectif (barre de progression)
- **Macros** : protéines / glucides / lipides (mini-graphique circulaire ou barres)
- **Poids** : dernière entrée + delta vs semaine précédente
- **Prochain entraînement** : si programme actif, affiche la prochaine séance suggérée

### 2. Actions rapides
Boutons d'accès rapide en un tap :
- "Commencer une séance"
- "Logger un repas"
- "Saisir mon poids"

### 3. Streak & Habitudes
- Streak actuel (jours consécutifs avec au moins 1 action loguée)
- Objectifs hebdomadaires :
  - Séances effectuées / objectif (ex: 3/4)
  - Jours nutrition loguée / 7
  - Jours poids saisi / 7
- Badge / animation si objectif hebdo atteint

### 4. Insights IA (passifs)
L'IA insère des cartes d'analyse dans le dashboard :
- "Tu as battu ton PR au développé-couché hier 💪"
- "Ta progression poids stagne depuis 2 semaines, pense à ajuster tes calories"
- "Volume total en hausse de 12% ce mois-ci"
- Rafraîchissement : 1 insight max par jour, non intrusif

### 5. Graphiques de progression (section inférieure)
- Poids sur 30 jours (courbe + tendance)
- Volume training hebdomadaire (barres)
- Calories moyennes sur 7 jours

## Navigation principale
Bottom navigation fixe avec 5 onglets :
| Icône | Onglet |
|---|---|
| 🏠 | Dashboard |
| 🏋️ | Workout |
| 🥗 | Nutrition |
| ⚖️ | Poids |
| 👤 | Profil |

## Assistant IA (accès global)
- Bouton flottant (FAB) présent sur toutes les pages
- Ouvre un drawer/modal avec chat IA
- Contexte : l'IA a accès aux données de l'utilisateur pour répondre en contexte
- Exemples : "Combien de protéines il me reste aujourd'hui ?", "Suggère-moi une séance pour ce soir"

## Responsive
- Mobile : layout en cartes scrollables verticalement
- Desktop : layout 2 colonnes (résumé + graphiques côte à côte)

## États
- **Premier jour** : onboarding completé, dashboard vide avec guides "Commence ta première séance"
- **Offline** : données locales affichées, badge "Mode hors-ligne" discret
- **Chargement** : skeletons par section
