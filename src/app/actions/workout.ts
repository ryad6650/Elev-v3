'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { WorkoutExercise } from "@/store/workoutStore";

export async function createExercise(data: {
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
}): Promise<{ id: string; nom: string; groupe_musculaire: string; equipement: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: ex, error } = await supabase
    .from('exercises')
    .insert({ user_id: user.id, is_global: false, ...data })
    .select('id, nom, groupe_musculaire, equipement')
    .single();

  if (error || !ex) throw new Error(error?.message ?? 'Erreur création exercice');
  return ex;
}

export interface RoutineExerciseData {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
  ordre: number;
}

type RoutineExRow = {
  ordre: number;
  series_cible: number | null;
  reps_cible: number | null;
  reps_cible_max: number | null;
  exercises: { id: string; nom: string; groupe_musculaire: string } | null;
};

export async function getRoutineExercises(routineId: string): Promise<RoutineExerciseData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('routine_exercises')
    .select('ordre, series_cible, reps_cible, reps_cible_max, exercises(id, nom, groupe_musculaire)')
    .eq('routine_id', routineId)
    .order('ordre');

  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as RoutineExRow[])
    .filter((re) => re.exercises !== null)
    .map((re) => ({
      exerciseId: re.exercises!.id,
      nom: re.exercises!.nom,
      groupeMusculaire: re.exercises!.groupe_musculaire,
      seriesCible: re.series_cible ?? 3,
      repsCible: re.reps_cible ?? 10,
      repsCibleMax: re.reps_cible_max ?? null,
      ordre: re.ordre,
    }));
}

export async function createRoutine(
  nom: string,
  exercices: { exerciseId: string; seriesCible: number; repsCible: number; repsCibleMax: number | null; ordre: number }[]
): Promise<{ id: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data: routine, error } = await supabase
    .from('routines')
    .insert({ user_id: user.id, nom })
    .select('id')
    .single();

  if (error || !routine) throw new Error(error?.message ?? 'Erreur création routine');

  if (exercices.length > 0) {
    const { error: reError } = await supabase.from('routine_exercises').insert(
      exercices.map((e) => ({
        routine_id: routine.id,
        exercise_id: e.exerciseId,
        ordre: e.ordre,
        series_cible: e.seriesCible,
        reps_cible: e.repsCible,
        reps_cible_max: e.repsCibleMax ?? null,
      }))
    );
    if (reError) throw new Error(reError.message);
  }

  revalidatePath('/workout');
  return { id: routine.id };
}

export async function updateRoutine(
  routineId: string,
  nom: string,
  exercices: { exerciseId: string; seriesCible: number; repsCible: number; repsCibleMax: number | null; ordre: number }[]
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await supabase.from('routines').update({ nom }).eq('id', routineId).eq('user_id', user.id);
  await supabase.from('routine_exercises').delete().eq('routine_id', routineId);

  if (exercices.length > 0) {
    await supabase.from('routine_exercises').insert(
      exercices.map((e) => ({
        routine_id: routineId,
        exercise_id: e.exerciseId,
        ordre: e.ordre,
        series_cible: e.seriesCible,
        reps_cible: e.repsCible,
        reps_cible_max: e.repsCibleMax ?? null,
      }))
    );
  }
  revalidatePath('/workout');
}

export async function deleteRoutine(routineId: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  await supabase.from('routines').delete().eq('id', routineId).eq('user_id', user.id);
  revalidatePath('/workout');
}

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
