import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Séances — Élev" };
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchWorkoutPageData } from "@/lib/workout";
import { fetchProgrammesData } from "@/lib/programmes";
import WorkoutPageClient from "@/components/workout/WorkoutPageClient";

export default async function WorkoutPage() {
  const user = await getUserFromMiddleware();
  if (!user) return null;

  const supabase = await createClient();
  const [workoutData, programmesData] = await Promise.all([
    fetchWorkoutPageData(supabase, user.id),
    fetchProgrammesData(supabase),
  ]);

  return (
    <WorkoutPageClient
      initialWorkoutData={workoutData}
      initialProgrammesData={programmesData}
    />
  );
}
