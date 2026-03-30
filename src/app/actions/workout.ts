'use server';

import { createClient } from "@/lib/supabase/server";
import type { WorkoutExercise } from "@/store/workoutStore";

export async function saveWorkout(
  exercises: WorkoutExercise[],
  debutAt: number,
  routineId: string | null
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const dureeMinutes = Math.round((Date.now() - debutAt) / 60000);
  const date = new Date(debutAt).toISOString().split("T")[0];

  const { data: workout, error: wError } = await supabase
    .from("workouts")
    .insert({ user_id: user.id, routine_id: routineId, date, duree_minutes: dureeMinutes })
    .select("id")
    .single();

  if (wError || !workout) throw new Error(wError?.message ?? "Erreur lors de la sauvegarde");

  const sets = exercises.flatMap((ex) =>
    ex.sets.map((s) => ({
      workout_id: workout.id,
      exercise_id: ex.exerciseId,
      ordre_exercice: ex.ordre,
      numero_serie: s.numSerie,
      poids: s.poids,
      reps: s.reps,
      completed: s.completed,
    }))
  );

  if (sets.length > 0) {
    const { error: sError } = await supabase.from("workout_sets").insert(sets);
    if (sError) throw new Error(sError.message);
  }

  return { id: workout.id };
}
