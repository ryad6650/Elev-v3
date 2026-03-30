# Auth — Spécifications

## Méthodes d'authentification
- Email + mot de passe (Supabase Auth)
- Google OAuth (Supabase OAuth provider)

## Flux d'inscription
1. Formulaire : email + mot de passe + confirmation MDP
2. Envoi email de vérification (Supabase)
3. Redirection vers onboarding après vérification

## Flux de connexion
- Email/MDP : formulaire standard
- Google : redirect OAuth, callback `/auth/callback`
- Session persistante (Supabase refresh token en cookie httpOnly)
- Reconnexion silencieuse au démarrage de l'app

## Onboarding — Tunnel complet (5 étapes)
**Étape 1 — Informations de base**
- Prénom, sexe, date de naissance, taille

**Étape 2 — Situation actuelle**
- Poids actuel (obligatoire pour initialiser le suivi)
- Niveau : Débutant / Intermédiaire / Avancé

**Étape 3 — Objectif fitness**
- Prise de masse / Perte de poids / Maintien / Performance
- Si perte/prise : saisie du poids cible

**Étape 4 — Photo de profil** (optionnel, skippable)
- Upload ou passer cette étape

**Étape 5 — Objectifs nutritionnels**
- Calories cibles / jour
- Répartition macros (protéines, glucides, lipides) en grammes ou %

→ À la fin : redirection vers Dashboard

## Gestion du compte
- **Changer email** : formulaire + email de confirmation sur la nouvelle adresse
- **Changer mot de passe** : saisie ancien MDP + nouveau + confirmation
- **Mot de passe oublié** : envoi lien de réinitialisation par email
- **Déconnexion** : invalidation session Supabase, nettoyage cache local
- **Suppression de compte** :
  - Confirmation par saisie du mot de passe
  - Proposition d'export (CSV + PDF) avant suppression
  - Suppression en cascade de toutes les données utilisateur (RLS + trigger Supabase)
  - Compte supprimé sous 30 jours (RGPD)

## Sécurité
- RLS Supabase : toutes les tables filtrées par `auth.uid()`
- Tokens stockés en cookie httpOnly, jamais en localStorage
- Rate limiting sur les endpoints auth (géré par Supabase)

## États d'erreur
- Email déjà utilisé
- Mot de passe trop faible (min 8 chars)
- Lien de vérification expiré (renvoi possible)
- Session expirée → redirect vers login
