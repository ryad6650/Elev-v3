import { createClient } from "@/lib/supabase/server";

export interface Routine {
  id: string;
  nom: string;
  exercisesCount: number;
}

export interface WorkoutHistoryItem {
  id: string;
  date: string;
  duree_minutes: number | null;
  routineNom: string | null;
  exercises: { nom: string; setsCount: number }[];
  volume: number;
}

export interface WorkoutPageData {
  routines: Routine[];
  historique: WorkoutHistoryItem[];
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

export async function fetchWorkoutPageData(): Promise<WorkoutPageData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const [routinesRes, workoutsRes] = await Promise.all([
    supabase
      .from("routines")
      .select("id, nom, routine_exercises(id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("workouts")
      .select(
        `id, date, duree_minutes,
        routines(nom),
        workout_sets(exercise_id, poids, reps, completed, exercises(nom))`
      )
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5),
  ]);

  const routines: Routine[] = (routinesRes.data ?? []).map((r) => ({
    id: r.id,
    nom: r.nom,
    exercisesCount: (r.routine_exercises as { id: string }[]).length,
  }));

  const historique: WorkoutHistoryItem[] = (
    (workoutsRes.data ?? []) as unknown as WorkoutJoin[]
  ).map((w) => {
    const exerciseMap = new Map<string, { nom: string; count: number }>();
    let volume = 0;
    for (const s of w.workout_sets ?? []) {
      if (!s.completed) continue;
      const nom = s.exercises?.nom ?? "Exercice";
      const prev = exerciseMap.get(s.exercise_id);
      exerciseMap.set(s.exercise_id, { nom, count: (prev?.count ?? 0) + 1 });
      volume += (s.poids ?? 0) * (s.reps ?? 0);
    }
    return {
      id: w.id,
      date: w.date,
      duree_minutes: w.duree_minutes,
      routineNom: w.routines?.nom ?? null,
      exercises: Array.from(exerciseMap.values()).map((e) => ({
        nom: e.nom,
        setsCount: e.count,
      })),
      volume: Math.round(volume),
    };
  });

  return { routines, historique };
}
