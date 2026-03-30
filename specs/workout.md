# Workout — Spécifications

## Deux modes de séance
1. **Séance libre** : l'utilisateur choisit ses exercices librement
2. **Depuis un programme** : l'utilisateur suit une séance définie dans son programme

## Bibliothèque d'exercices
- Base pré-définie par l'app (exercices classiques avec groupe musculaire, équipement)
- L'utilisateur peut créer ses propres exercices (nom, groupe musculaire, type)
- Recherche par nom + filtre par groupe musculaire / équipement
- Exercices custom visibles uniquement par leur créateur

## Création de programme
- Nom du programme + description optionnelle
- Ajouter autant de séances que voulu (ex: Séance A, Séance B...)
- Chaque séance contient une liste d'exercices ordonnés
- Par exercice : définir le nombre de séries + **fourchette de reps cibles** (ex: 3×8-12)
- Pas de planning par jour : l'utilisateur choisit quelle séance faire quand il s'entraîne

## Données saisies par série
- **Reps** effectuées (avec la fourchette cible affichée en référence)
- **Poids** (kg ou lbs)
- **Notes** texte libres par série (optionnel)
- Marquage de la série comme complète (checkbox)

## Timer intégré
- **Timer de repos** : se lance automatiquement après validation d'une série (durée paramétrable)
- **Chrono de séance** : temps total depuis le début affiché en permanence
- Notification sonore / vibration à la fin du timer de repos (si permissions accordées)

## Déroulement d'une séance
1. Sélection "Séance libre" ou choix d'une séance de programme
2. Écran de séance actif avec liste d'exercices
3. Pour chaque exercice : saisie des séries (précédentes valeurs pré-remplies)
4. Validation série → timer de repos automatique
5. Suggestion IA de charge (si progression détectée) : toast non-bloquant
6. Fin de séance : récapitulatif (durée, volume total, PRs battus)

## Sauvegarde & reprise
- **Sauvegarde automatique** à chaque série validée (IndexedDB local + sync Supabase)
- Si l'utilisateur quitte l'app : séance marquée "en cours"
- Au retour : proposition de reprendre la séance interrompue
- Séance abandonnée (> 24h) : archivée avec les séries complétées

## Personal Records (PRs)
- Détection automatique à chaque série : si poids × reps > PR précédent → nouveau PR
- Animation/feedback visuel immédiat sur l'écran de séance
- Page "Mes PRs" : liste tous les exercices avec le PR actuel (poids max, 1RM estimé)
- Historique des PRs par exercice (graphique de progression)
- 1RM estimé calculé via formule Epley : `poids × (1 + reps/30)`

## Progression & IA
- Avant chaque exercice : pré-remplissage avec les charges de la dernière séance identique
- **Suggestions IA** : si l'utilisateur atteint le haut de sa fourchette de reps lors de 2 séances consécutives → toast suggérant d'augmenter le poids
- L'IA peut être consultée via l'assistant global pour analyser la progression

## Historique des séances
- Liste chronologique des séances passées
- Filtrage par programme ou exercice spécifique
- Détail d'une séance : tous les exercices, séries, notes

## Offline
- Séance entièrement faisable offline (IndexedDB)
- Sync automatique à la reconnexion via la file d'actions horodatées
