# Nutrition — Spécifications

## Journal alimentaire
- Navigation par date (passé, présent, futur — ex: préparer des repas à l'avance)
- 4 repas par défaut : Petit-déjeuner / Déjeuner / Dîner / Collations
- L'utilisateur peut ajouter des repas supplémentaires ou renommer les slots

## Ajout d'aliments — 3 méthodes

### 1. Recherche textuelle
- Recherche dans la base combinée OpenFoodFacts + USDA FoodData Central
- Affichage : nom, kcal/100g, macros principales
- Saisie de la quantité en grammes (ou portion standard)
- Calcul automatique des nutriments selon la quantité

### 2. Scan code-barres
- Scan via caméra (API Browser MediaDevices / react-zxing)
- Lookup dans OpenFoodFacts par code EAN
- Si non trouvé : proposition de créer l'aliment manuellement

### 3. Aliments et repas custom
- **Aliment custom** : nom + valeurs nutritionnelles pour 100g (calories, macros, fibres, eau, micros)
- **Recette** : assemblage de plusieurs aliments avec quantités → 1 entrée composite
- Recettes sauvegardées dans le profil, réutilisables
- **Copier un jour** : dupliquer tous les repas d'une date précédente vers la date courante

## Indicateurs tracés par jour
- Calories totales (kcal)
- Protéines (g)
- Glucides (g) dont sucres
- Lipides (g) dont saturés
- Fibres (g)
- Eau (ml) — saisie manuelle séparée
- Micros : Vitamine C, Vitamine D, Fer, Calcium, Sodium (si disponibles dans la source)

## Objectifs nutritionnels
- Définis manuellement dans le profil (étape onboarding ou section Profil)
- Calories cibles + répartition macros en grammes
- Affichage : consommé / objectif en barres de progression
- Couleur : vert si dans l'objectif, orange si > 10% au-dessus

## Favoris & accès rapide
- Marquer n'importe quel aliment ou recette comme favori
- Section "Favoris" et "Récents" en haut de la recherche pour accès rapide

## Vue quotidienne
- En-tête : anneau calories (consommé / objectif) + 3 barres macros
- Liste des repas avec aliments et sous-totaux par repas
- Total journalier en bas
- Accès au détail micros (vue secondaire, pas sur l'écran principal)

## Historique
- Calendrier / liste des jours passés
- Graphiques : calories et macros sur 7 / 30 jours
- Jour moyen sur une période

## Base de données aliments
- Priorité : OpenFoodFacts (produits emballés européens)
- Complément : USDA FoodData Central (aliments bruts, nutrition précise)
- Aliments custom : stockés dans Supabase liés à l'utilisateur
- Cache local des aliments récemment utilisés (offline)

## Offline
- Aliments récents et favoris disponibles offline
- Logging des repas fonctionne offline (IndexedDB)
- Recherche limitée aux aliments cachés offline si pas de connexion
