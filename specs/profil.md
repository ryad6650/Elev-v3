# Profil — Spécifications

## Données utilisateur

### Informations de base
- Prénom (affiché dans l'app et le dashboard)
- Sexe (Homme / Femme / Non-spécifié)
- Date de naissance → âge calculé
- Taille (cm) → utilisée pour le calcul IMC

### Objectif fitness
- Type : Prise de masse / Perte de poids / Maintien / Performance
- Niveau : Débutant / Intermédiaire / Avancé
- Poids cible (optionnel)

### Photo de profil
- Upload via Supabase Storage (JPEG/PNG, max 5 MB)
- Redimensionnement côté client avant upload (max 400×400px)
- URL signée ou publique selon configuration Storage bucket

### Historique & Niveau
- Date de début dans l'app (date d'inscription)
- Niveau fitness (modifiable à tout moment)

## Objectifs nutritionnels
- Calories cibles par jour
- Protéines cibles (g)
- Glucides cibles (g)
- Lipides cibles (g)
- Fibres cibles (g, optionnel)
- Eau cible (ml/j, optionnel)

## Préférences de l'app
- Unité de poids : kg / lbs
- Thème : Clair / Sombre / Système
- Langue : Français / English (v3 : FR par défaut)
- Notifications : activer/désactiver + heure du rappel poids

## Gestion du compte
- Modifier email (confirmation par email sur nouvelle adresse)
- Modifier mot de passe (saisie ancien MDP requis)
- **Déconnexion** avec confirmation
- **Supprimer le compte** :
  - Avertissement RGPD + proposition d'export
  - Saisie du mot de passe pour confirmer
  - Suppression complète sous 30 jours (soft delete → hard delete planifié)

## Export des données
- **CSV** : export de toutes les tables (workouts, nutrition, poids) en fichiers séparés, zippés
- **PDF** : rapport de progression sur une période choisie (graphiques + statistiques)
- Généré côté serveur (Next.js API route), téléchargement direct
- Accessible depuis la section Compte du Profil

## Section statistiques globales (vue synthèse)
- Nombre total de séances effectuées
- Total de séances cette semaine / ce mois
- Jours de suivi nutritionnel ce mois
- Streak actuel et streak maximum

## Offline
- Les données profil sont cachées localement
- Modifications offline synchronisées au retour en ligne
