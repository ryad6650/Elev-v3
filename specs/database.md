# Database — Spécifications Supabase

## Stratégie offline & sync
**File d'actions optimiste horodatée** :
- Chaque action locale est enregistrée avec un `client_timestamp` et un `action_id` (UUID)
- À la sync : envoi de la file → serveur applique dans l'ordre des timestamps
- Conflits (même `user_id` + même `date` + même entité) : last-write-wins par `client_timestamp`
- Table `sync_queue` locale (IndexedDB) vidée après sync confirmée

## Tables principales

### `profiles`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | = auth.uid() |
| first_name | text | |
| sex | enum | male/female/unspecified |
| birth_date | date | |
| height_cm | integer | |
| fitness_goal | enum | bulk/cut/maintain/performance |
| fitness_level | enum | beginner/intermediate/advanced |
| target_weight_kg | numeric(5,2) | nullable |
| avatar_url | text | Supabase Storage URL |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `nutrition_goals`
| Colonne | Type | Notes |
|---|---|---|
| user_id | uuid FK profiles | |
| calories_kcal | integer | |
| protein_g | integer | |
| carbs_g | integer | |
| fat_g | integer | |
| fiber_g | integer | nullable |
| water_ml | integer | nullable |

### `weight_entries`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| date | date | unique per user |
| weight_kg | numeric(5,2) | |
| client_timestamp | timestamptz | pour sync |

### `exercises`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | null = exercice global app |
| name | text | |
| muscle_group | text | |
| equipment | text | nullable |
| is_custom | boolean | |

### `programs`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| name | text | |
| description | text | nullable |
| is_active | boolean | un seul actif à la fois |

### `program_sessions`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| program_id | uuid FK | |
| name | text | ex: "Séance A - Push" |
| order_index | integer | |

### `program_session_exercises`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| session_id | uuid FK | |
| exercise_id | uuid FK | |
| sets | integer | nombre de séries cibles |
| reps_min | integer | fourchette basse |
| reps_max | integer | fourchette haute |
| order_index | integer | |

### `workout_logs`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| program_session_id | uuid nullable | null = séance libre |
| started_at | timestamptz | |
| ended_at | timestamptz | nullable |
| status | enum | active/completed/abandoned |
| client_timestamp | timestamptz | |

### `workout_sets`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| workout_log_id | uuid FK | |
| exercise_id | uuid FK | |
| set_number | integer | |
| reps | integer | |
| weight_kg | numeric(6,2) | |
| notes | text | nullable |
| completed | boolean | |
| client_timestamp | timestamptz | |

### `food_items` (aliments custom utilisateur)
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| name | text | |
| calories_per_100g | numeric | |
| protein_g | numeric | |
| carbs_g | numeric | |
| fat_g | numeric | |
| fiber_g | numeric | nullable |
| source | enum | custom/openfoodfacts/usda |
| external_id | text | nullable, barcode ou USDA ID |

### `recipes`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| name | text | |

### `recipe_ingredients`
| Colonne | Type | Notes |
|---|---|---|
| recipe_id | uuid FK | |
| food_item_id | uuid FK | |
| quantity_g | numeric | |

### `nutrition_logs`
| Colonne | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| date | date | |
| meal_slot | enum | breakfast/lunch/dinner/snack/custom |
| meal_name | text | nullable, pour slots custom |
| food_item_id | uuid nullable | |
| recipe_id | uuid nullable | |
| quantity_g | numeric | |
| client_timestamp | timestamptz | |

## RLS Policies
Toutes les tables : `USING (auth.uid() = user_id)` pour SELECT/INSERT/UPDATE/DELETE.
`exercises` globaux : `user_id IS NULL` accessible à tous en lecture.

## Indexes importants
- `weight_entries(user_id, date)`
- `workout_logs(user_id, started_at)`
- `nutrition_logs(user_id, date)`
- `workout_sets(workout_log_id)`
