# Poids — Spécifications

## Saisie du poids
- Entrée manuelle quotidienne (valeur en kg avec décimale, ex: 78.4)
- Date pré-sélectionnée sur aujourd'hui, modifiable pour corriger un jour passé
- Saisie rapide depuis le Dashboard (action rapide) ou depuis l'onglet Poids
- Une seule entrée par jour (modification possible si déjà saisie)
- Rappel matinal (notification push) si pas encore saisi

## Graphique de progression
- Courbe des points réels (chaque pesée)
- Ligne de tendance (moyenne mobile sur 7 jours) pour lisser les variations naturelles
- Axes : date en X, poids en Y (échelle adaptée aux données, pas forcément à 0)
- Sélecteurs de période : 7j / 30j / 3 mois / 6 mois / Tout
- Si objectif défini : ligne horizontale pointillée indiquant le poids cible

## Statistiques affichées
- Poids actuel (dernière entrée)
- Variation vs 7 jours (+ ou −)
- Variation vs 30 jours
- Poids minimum / maximum sur la période sélectionnée
- Tendance : calcul basé sur la différence de moyenne mobile entre début et fin de période

## Objectif de poids
- L'utilisateur saisit un **poids cible** (défini en onboarding ou dans Profil)
- Affichage : "X kg restants" ou "Objectif atteint ✓"
- Pas de date cible (v3) — juste la valeur à atteindre
- L'IA peut commenter la progression vers l'objectif dans les insights dashboard

## Historique
- Liste chronologique de toutes les entrées (date + valeur)
- Modification ou suppression d'une entrée existante
- Pas de limite de rétention des données

## Calculs dérivés
- **IMC** affiché à titre indicatif (poids / taille²), mis à jour à chaque pesée
- Catégorie IMC : Insuffisance / Normal / Surpoids / Obésité (OMS)
- Aucun jugement dans l'UI — données affichées neutrement

## Offline
- Saisie offline possible (stockée en IndexedDB)
- Sync automatique à la reconnexion
- Graphique disponible offline avec les données déjà synchronisées
