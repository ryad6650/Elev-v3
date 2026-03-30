# Élev v3 — Spécifications Globales

## Vision
App fitness complète (PWA) permettant de suivre entraînements, nutrition et poids.
Gratuite, 100% personnelle (pas de social), avec IA intégrée pour suggestions et insights.

## Stack technique
- **Frontend** : Next.js (PWA installable)
- **Backend / Auth / DB** : Supabase (PostgreSQL + RLS + Storage)
- **IA** : Claude API (suggestions charges, assistant chat, insights dashboard)
- **Offline** : Service Worker + file d'actions optimiste avec sync par timestamps

## Modules principaux
| Module | Description |
|---|---|
| Auth | Email/MDP + Google OAuth, onboarding tunnel complet |
| Dashboard | Résumé du jour, actions rapides, streaks, insights IA |
| Workout | Séances libres + programmes, bibliothèque exercices, timer, PRs auto |
| Nutrition | Log aliments (recherche + scan + custom), macros + micros, journal par date |
| Poids | Entrée quotidienne, courbe + tendance, poids cible |
| Profil | Infos perso, objectifs, photo, niveau, gestion compte |

## Navigation
Bottom navigation : **Dashboard / Workout / Nutrition / Poids / Profil**

## Fonctionnalités transversales
- **Offline complet** : toutes les actions fonctionnent sans connexion, sync auto au retour
- **Sync** : file d'actions optimiste horodatée, merge par timestamps côté serveur
- **IA** : suggestions de charges pendant séance + assistant chat + insights passifs
- **Notifications** : rappel matinal prise de poids
- **Export** : CSV (données brutes) + PDF (rapport de progression)
- **RGPD** : suppression compte + export des données avant suppression

## MVP (priorité absolue)
1. Workout logging (séances + exercices + séries)
2. Suivi du poids (courbe + objectif)
3. Nutrition logging (macros journaliers)
4. Dashboard de progression

## Hors scope v3
- Fonctionnalités sociales / communautaires
- Monétisation / abonnements
- Multi-profils sur un même compte
- Apple Sign In
