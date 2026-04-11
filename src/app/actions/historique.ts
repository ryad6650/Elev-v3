"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { revalidatePath } from "next/cache";

export interface WorkoutDetailExercise {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  sets: {
    id: string;
    numSerie: number;
    poids: number | null;
    reps: number | null;
    completed: boolean;
    isWarmup: boolean;
  }[];
}

export interface WorkoutDetail {
  id: string;
  date: string;
  duree_minutes: number | null;
  routineNom: string | null;
  exercises: WorkoutDetailExercise[];
}

export async function fetchWorkoutDetail(
  workoutId: string,
): Promise<WorkoutDetail> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  const [workoutRes, setsRes] = await Promise.all([
    supabase
      .from("workouts")
      .select("id, date, duree_minutes, routine_id, routines(nom)")
      .eq("id", workoutId)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("workout_sets")
      .select("id, exercise_id, numero_serie, poids, reps, completed")
      .eq("workout_id", workoutId)
      .order("ordre_exercice")
      .order("numero_serie"),
  ]);

  if (workoutRes.error || !workoutRes.data)
    throw new Error(workoutRes.error?.message ?? "Séance introuvable");
  if (setsRes.error) throw new Error(setsRes.error.message);

  const workout = workoutRes.data;
  const sets = setsRes.data ?? [];

  // Récupérer les exercices séparément
  const exerciseIds = [...new Set(sets.map((s) => s.exercise_id))];
  const exLookup = new Map<
    string,
    { nom: string; groupe_musculaire: string }
  >();

  if (exerciseIds.length > 0) {
    const { data: exData } = await supabase
      .from("exercises")
      .select("id, nom, groupe_musculaire")
      .in("id", exerciseIds);
    for (const e of exData ?? []) {
      exLookup.set(e.id, {
        nom: e.nom,
        groupe_musculaire: e.groupe_musculaire,
      });
    }
  }

  const rawWorkout = workout as unknown as {
    id: string;
    date: string;
    duree_minutes: number | null;
    routines: { nom: string } | null;
  };

  const exMap = new Map<string, WorkoutDetailExercise>();
  for (const s of sets) {
    const exId = s.exercise_id;
    if (!exMap.has(exId)) {
      const info = exLookup.get(exId);
      exMap.set(exId, {
        exerciseId: exId,
        nom: info?.nom ?? "Exercice",
        groupeMusculaire: info?.groupe_musculaire ?? "",
        sets: [],
      });
    }
    exMap.get(exId)!.sets.push({
      id: s.id,
      numSerie: s.numero_serie ?? 0,
      poids: s.poids,
      reps: s.reps,
      completed: s.completed ?? false,
      isWarmup: false,
    });
  }

  return {
    id: rawWorkout.id,
    date: rawWorkout.date,
    duree_minutes: rawWorkout.duree_minutes,
    routineNom: rawWorkout.routines?.nom ?? null,
    exercises: Array.from(exMap.values()),
  };
}

export async function deleteWorkout(workoutId: string): Promise<void> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("workouts")
    .delete()
    .eq("id", workoutId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/historique");
  revalidatePath("/workout");
}

export async function updateWorkoutSet(
  setId: string,
  data: { poids?: number | null; reps?: number | null },
): Promise<void> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) throw new Error("Non authentifié");

  // Vérifier que le set appartient à l'utilisateur
  const { data: set } = await supabase
    .from("workout_sets")
    .select("workout_id, workouts(user_id)")
    .eq("id", setId)
    .single();

  const owner = (set as unknown as { workouts: { user_id: string } | null })
    ?.workouts?.user_id;
  if (!owner || owner !== user.id) throw new Error("Non autorisé");

  const { error } = await supabase
    .from("workout_sets")
    .update(data)
    .eq("id", setId);

  if (error) throw new Error(error.message);
}
