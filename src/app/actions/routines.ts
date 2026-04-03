"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface RoutineExerciseData {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  gifUrl: string | null;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
  ordre: number;
  restDuration?: number | null;
  poidsRef?: number | null;
  repsRef?: number | null;
}

type RoutineExRow = {
  ordre: number;
  series_cible: number | null;
  reps_cible: number | null;
  reps_cible_max: number | null;
  exercises: {
    id: string;
    nom: string;
    groupe_musculaire: string;
    gif_url: string | null;
  } | null;
};

type SupabaseClient = Awaited<ReturnType<typeof createClient>>;

async function getLastSessionRefs(
  supabase: SupabaseClient,
  userId: string,
  exerciseIds: string[],
): Promise<Record<string, { poids: number; reps: number }>> {
  if (exerciseIds.length === 0) return {};
  const { data } = await supabase
    .from("workout_sets")
    .select("exercise_id, poids, reps, workout_id, workouts!inner(date)")
    .eq("completed", true)
    .in("exercise_id", exerciseIds)
    .eq("workouts.user_id", userId)
    .order("date", { referencedTable: "workouts", ascending: false })
    .order("poids", { ascending: false })
    .limit(500);

  const map: Record<string, { poids: number; reps: number }> = {};
  for (const row of data ?? []) {
    if (map[row.exercise_id]) continue;
    if (row.poids != null) {
      map[row.exercise_id] = { poids: Number(row.poids), reps: row.reps ?? 0 };
    }
  }
  return map;
}

export async function getExerciseLastRefs(
  exerciseIds: string[],
): Promise<Record<string, { poids: number; reps: number }>> {
  if (exerciseIds.length === 0) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};
  return getLastSessionRefs(supabase, user.id, exerciseIds);
}

export async function getUserExerciseRests(
  exerciseIds: string[],
): Promise<Record<string, number>> {
  if (exerciseIds.length === 0) return {};
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from("user_exercise_rest")
    .select("exercise_id, rest_duration")
    .eq("user_id", user.id)
    .in("exercise_id", exerciseIds);

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.exercise_id] = row.rest_duration;
  }
  return map;
}

export async function getRoutineExercises(
  routineId: string,
): Promise<RoutineExerciseData[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("routine_exercises")
    .select(
      "ordre, series_cible, reps_cible, reps_cible_max, exercises(id, nom, groupe_musculaire, gif_url)",
    )
    .eq("routine_id", routineId)
    .order("ordre");

  if (error) throw new Error(error.message);

  const rows = ((data ?? []) as unknown as RoutineExRow[]).filter(
    (re) => re.exercises !== null,
  );

  const exerciseIds = rows.map((re) => re.exercises!.id);
  const [restMap, refsMap] = await Promise.all([
    getUserExerciseRests(exerciseIds),
    getLastSessionRefs(supabase, user.id, exerciseIds),
  ]);

  return rows.map((re) => ({
    exerciseId: re.exercises!.id,
    nom: re.exercises!.nom,
    groupeMusculaire: re.exercises!.groupe_musculaire,
    gifUrl: re.exercises!.gif_url ?? null,
    seriesCible: re.series_cible ?? 3,
    repsCible: re.reps_cible ?? 10,
    repsCibleMax: re.reps_cible_max ?? null,
    ordre: re.ordre,
    restDuration: restMap[re.exercises!.id] ?? null,
    poidsRef: refsMap[re.exercises!.id]?.poids ?? null,
    repsRef: refsMap[re.exercises!.id]?.reps ?? null,
  }));
}

export async function createRoutine(
  nom: string,
  exercices: {
    exerciseId: string;
    seriesCible: number;
    repsCible: number;
    repsCibleMax: number | null;
    ordre: number;
  }[],
): Promise<{ id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: routine, error } = await supabase
    .from("routines")
    .insert({ user_id: user.id, nom })
    .select("id")
    .single();

  if (error || !routine)
    throw new Error(error?.message ?? "Erreur création routine");

  if (exercices.length > 0) {
    const { error: reError } = await supabase.from("routine_exercises").insert(
      exercices.map((e) => ({
        routine_id: routine.id,
        exercise_id: e.exerciseId,
        ordre: e.ordre,
        series_cible: e.seriesCible,
        reps_cible: e.repsCible,
        reps_cible_max: e.repsCibleMax ?? null,
      })),
    );
    if (reError) throw new Error(reError.message);
  }

  revalidatePath("/workout");
  return { id: routine.id };
}

export async function updateRoutine(
  routineId: string,
  nom: string,
  exercices: {
    exerciseId: string;
    seriesCible: number;
    repsCible: number;
    repsCibleMax: number | null;
    ordre: number;
  }[],
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: owned } = await supabase
    .from("routines")
    .update({ nom })
    .eq("id", routineId)
    .eq("user_id", user.id)
    .select("id")
    .single();
  if (!owned) throw new Error("Non autorisé");
  await supabase.from("routine_exercises").delete().eq("routine_id", routineId);

  if (exercices.length > 0) {
    const { error: reError } = await supabase.from("routine_exercises").insert(
      exercices.map((e) => ({
        routine_id: routineId,
        exercise_id: e.exerciseId,
        ordre: e.ordre,
        series_cible: e.seriesCible,
        reps_cible: e.repsCible,
        reps_cible_max: e.repsCibleMax ?? null,
      })),
    );
    if (reError) throw new Error(reError.message);
  }
  revalidatePath("/workout");
}

export async function deleteRoutine(routineId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  await supabase
    .from("routines")
    .delete()
    .eq("id", routineId)
    .eq("user_id", user.id);
  revalidatePath("/workout");
}

export async function saveExerciseRest(
  exerciseId: string,
  restDuration: number | null,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  if (restDuration == null || restDuration <= 0) {
    await supabase
      .from("user_exercise_rest")
      .delete()
      .eq("user_id", user.id)
      .eq("exercise_id", exerciseId);
  } else {
    await supabase.from("user_exercise_rest").upsert(
      {
        user_id: user.id,
        exercise_id: exerciseId,
        rest_duration: restDuration,
      },
      { onConflict: "user_id,exercise_id" },
    );
  }
}
