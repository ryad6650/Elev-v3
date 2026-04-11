/** Helpers purs pour le calcul d'historique — streak, PRs, agrégation nutrition */

import type { PRRecord, NutritionDaySummary } from "./historique";

type SetJoin = {
  exercise_id: string;
  poids: number | null;
  reps: number | null;
  completed: boolean;
  exercises: { nom: string } | null;
};

type WorkoutJoin = {
  id: string;
  date: string;
  duree_minutes: number | null;
  routines: { nom: string } | null;
  workout_sets: SetJoin[];
};

export type { SetJoin, WorkoutJoin };

type NutriEntryJoin = {
  date: string;
  quantite_g: number;
  quantite_portion: number | null;
  aliments: {
    calories: number;
    proteines: number | null;
    glucides: number | null;
    lipides: number | null;
    taille_portion_g: number | null;
  } | null;
};

export type { NutriEntryJoin };

export function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (sorted[0] !== today && sorted[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    const curr = new Date(sorted[i] + "T12:00:00");
    const prev = new Date(sorted[i - 1] + "T12:00:00");
    const diff = Math.round((prev.getTime() - curr.getTime()) / 86400000);
    if (diff === 1) streak++;
    else break;
  }
  return streak;
}

export function computePRs(workouts: WorkoutJoin[]): PRRecord[] {
  const map = new Map<string, { nom: string; poids: number; reps: number }>();
  for (const w of workouts) {
    for (const s of w.workout_sets) {
      if (!s.completed || !s.poids) continue;
      const nom = s.exercises?.nom ?? "Exercice";
      const prev = map.get(s.exercise_id);
      if (!prev || s.poids > prev.poids) {
        map.set(s.exercise_id, { nom, poids: s.poids, reps: s.reps ?? 0 });
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => b.poids - a.poids)
    .slice(0, 3)
    .map((e) => ({ exerciceNom: e.nom, poidsMax: e.poids, repsAuMax: e.reps }));
}

export function aggregateNutrition(
  entries: NutriEntryJoin[],
): NutritionDaySummary[] {
  const map = new Map<string, NutritionDaySummary>();
  for (const e of entries) {
    if (!e.aliments) continue;
    const a = e.aliments;
    const qg =
      e.quantite_portion != null && a.taille_portion_g
        ? e.quantite_portion * a.taille_portion_g
        : e.quantite_g;
    const f = qg / 100;
    const day = map.get(e.date) ?? {
      date: e.date,
      calories: 0,
      proteines: 0,
      glucides: 0,
      lipides: 0,
    };
    day.calories += Math.round(a.calories * f);
    day.proteines += Math.round((a.proteines ?? 0) * f);
    day.glucides += Math.round((a.glucides ?? 0) * f);
    day.lipides += Math.round((a.lipides ?? 0) * f);
    map.set(e.date, day);
  }
  return Array.from(map.values());
}
