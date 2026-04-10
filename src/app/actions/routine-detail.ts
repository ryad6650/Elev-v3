"use server";

import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";

export interface RoutineVolumePoint {
  date: string;
  volume: number;
  totalReps: number;
  duree_minutes: number | null;
}

type WorkoutSetRow = {
  poids: number | null;
  reps: number | null;
  completed: boolean;
};

type WorkoutRow = {
  date: string;
  duree_minutes: number | null;
  workout_sets: WorkoutSetRow[];
};

export async function getRoutineVolumeHistory(
  routineId: string,
): Promise<RoutineVolumePoint[]> {
  const [supabase, user] = await Promise.all([
    createClient(),
    getUserFromMiddleware(),
  ]);
  if (!user) return [];

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const { data } = await supabase
    .from("workouts")
    .select("date, duree_minutes, workout_sets(poids, reps, completed)")
    .eq("user_id", user.id)
    .eq("routine_id", routineId)
    .gte("date", threeMonthsAgo.toISOString().split("T")[0])
    .order("date", { ascending: true });

  return ((data ?? []) as unknown as WorkoutRow[]).map((w) => {
    let volume = 0;
    let totalReps = 0;
    for (const s of w.workout_sets ?? []) {
      if (!s.completed) continue;
      volume += (s.poids ?? 0) * (s.reps ?? 0);
      totalReps += s.reps ?? 0;
    }
    return {
      date: w.date,
      volume: Math.round(volume),
      totalReps,
      duree_minutes: w.duree_minutes,
    };
  });
}
