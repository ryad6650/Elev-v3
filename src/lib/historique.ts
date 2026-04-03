import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

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

export interface HistoriquePageData {
  totalSeances: number;
  streakActuel: number;
  prsRecents: PRRecord[];
  workouts: HistoriqueWorkout[];
}

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

function computeStreak(dates: string[]): number {
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

function computePRs(workouts: WorkoutJoin[]): PRRecord[] {
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

export async function fetchHistoriqueData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<HistoriquePageData> {
  const [workoutsRes, countRes] = await Promise.all([
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
  ]);

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

  return {
    totalSeances: countRes.count ?? 0,
    streakActuel: computeStreak(raw.map((w) => w.date)),
    prsRecents: computePRs(raw),
    workouts,
  };
}
