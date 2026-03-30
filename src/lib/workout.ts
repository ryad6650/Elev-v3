import { createClient } from "@/lib/supabase/server";

export interface Routine {
  id: string;
  nom: string;
  exercisesCount: number;
  groupes: string[];
  dureeEstimee: number;
  derniereSeance: string | null;
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

type RoutineExerciseWithEx = {
  id: string;
  exercises: { groupe_musculaire: string } | null;
};

type RoutineWithExercises = {
  id: string;
  nom: string;
  routine_exercises: RoutineExerciseWithEx[];
};

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

  const [routinesRes, workoutsRes, lastWorkoutsRes] = await Promise.all([
    supabase
      .from("routines")
      .select("id, nom, routine_exercises(id, exercises(groupe_musculaire))")
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
    supabase
      .from("workouts")
      .select("routine_id, date")
      .eq("user_id", user.id)
      .not("routine_id", "is", null)
      .order("date", { ascending: false }),
  ]);

  const lastWorkoutMap = new Map<string, string>();
  for (const w of lastWorkoutsRes.data ?? []) {
    if (w.routine_id && !lastWorkoutMap.has(w.routine_id)) {
      lastWorkoutMap.set(w.routine_id, w.date);
    }
  }

  const routines: Routine[] = (
    (routinesRes.data ?? []) as unknown as RoutineWithExercises[]
  ).map((r) => {
    const groupesSet = new Set<string>();
    for (const re of r.routine_exercises) {
      if (re.exercises?.groupe_musculaire) {
        groupesSet.add(re.exercises.groupe_musculaire.toLowerCase());
      }
    }
    const exercisesCount = r.routine_exercises.length;
    const totalSets = r.routine_exercises.reduce((sum, e) => sum + (e.series_cible ?? 3), 0);
    return {
      id: r.id,
      nom: r.nom,
      exercisesCount,
      groupes: Array.from(groupesSet),
      dureeEstimee: Math.max(10, Math.round(totalSets * 3.5)),
      derniereSeance: lastWorkoutMap.get(r.id) ?? null,
    };
  });

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
