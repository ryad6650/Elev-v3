import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { computePRs, aggregateNutrition } from "./historique-helpers";
import type { WorkoutJoin, NutriEntryJoin } from "./historique-helpers";
import { computeStreak } from "./date-utils";

export interface HistoriqueWorkout {
  id: string;
  date: string;
  duree_minutes: number | null;
  routineNom: string | null;
  exercises: { nom: string; setsCount: number }[];
  volume: number;
}

export interface PRRecord {
  exerciceNom: string;
  poidsMax: number;
  repsAuMax: number;
}

export interface SommeilRecord {
  id: string;
  date: string;
  duree_minutes: number;
}

export interface NutritionDaySummary {
  date: string;
  calories: number;
  proteines: number;
  glucides: number;
  lipides: number;
}

export interface PoidsRecord {
  date: string;
  poids: number;
}

export interface NutritionObjectifs {
  calories: number;
  proteines: number | null;
  glucides: number | null;
  lipides: number | null;
}

export interface HistoriquePageData {
  totalSeances: number;
  streakActuel: number;
  prsRecents: PRRecord[];
  workouts: HistoriqueWorkout[];
  sommeil: SommeilRecord[];
  nutritionDays: NutritionDaySummary[];
  poidsHistory: PoidsRecord[];
  objectifs: NutritionObjectifs;
}

export async function fetchHistoriqueData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<HistoriquePageData> {
  const [workoutsRes, countRes, sommeilRes, nutriRes, poidsRes, profileRes] =
    await Promise.all([
      supabase
        .from("workouts")
        .select(
          `id, date, duree_minutes,
        routines(nom),
        workout_sets(exercise_id, poids, reps, completed, exercises(nom))`,
        )
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30),
      supabase
        .from("workouts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("sommeil")
        .select("id, date, duree_minutes")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30),
      supabase
        .from("nutrition_entries")
        .select(
          "date, quantite_g, quantite_portion, aliments(calories, proteines, glucides, lipides, taille_portion_g)",
        )
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(300),
      supabase
        .from("poids_history")
        .select("date, poids")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30),
      supabase
        .from("profiles")
        .select(
          "objectif_calories, objectif_proteines, objectif_glucides, objectif_lipides",
        )
        .eq("id", userId)
        .single(),
    ]);

  if (workoutsRes.error) throw new Error(workoutsRes.error.message);

  const raw = (workoutsRes.data ?? []) as unknown as WorkoutJoin[];

  const workouts: HistoriqueWorkout[] = raw.map((w) => {
    const exMap = new Map<string, { nom: string; count: number }>();
    let volume = 0;
    for (const s of w.workout_sets ?? []) {
      if (!s.completed) continue;
      const nom = s.exercises?.nom ?? "Exercice";
      const prev = exMap.get(s.exercise_id);
      exMap.set(s.exercise_id, { nom, count: (prev?.count ?? 0) + 1 });
      volume += (s.poids ?? 0) * (s.reps ?? 0);
    }
    return {
      id: w.id,
      date: w.date,
      duree_minutes: w.duree_minutes,
      routineNom: w.routines?.nom ?? null,
      exercises: Array.from(exMap.values()).map((e) => ({
        nom: e.nom,
        setsCount: e.count,
      })),
      volume: Math.round(volume),
    };
  });

  const sommeil: SommeilRecord[] = (sommeilRes.data ?? []).map((s) => ({
    id: s.id,
    date: s.date,
    duree_minutes: s.duree_minutes,
  }));

  const nutriEntries = (nutriRes.data ?? []) as unknown as NutriEntryJoin[];
  const nutritionDays = aggregateNutrition(nutriEntries);

  const poidsHistory: PoidsRecord[] = (poidsRes.data ?? [])
    .filter((p): p is typeof p & { date: string } => p.date !== null)
    .map((p) => ({ date: p.date, poids: p.poids }));

  const profile = profileRes.data;
  const objectifs: NutritionObjectifs = {
    calories: profile?.objectif_calories ?? 2200,
    proteines: profile?.objectif_proteines ?? null,
    glucides: profile?.objectif_glucides ?? null,
    lipides: profile?.objectif_lipides ?? null,
  };

  return {
    totalSeances: countRes.count ?? 0,
    streakActuel: computeStreak(raw.map((w) => w.date)),
    prsRecents: computePRs(raw),
    workouts,
    sommeil,
    nutritionDays,
    poidsHistory,
    objectifs,
  };
}
