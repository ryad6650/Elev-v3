import { createClient } from "@/lib/supabase/server";
import { fetchWorkoutPageData } from "@/lib/workout";
import { fetchProgrammesData } from "@/lib/programmes";
import WorkoutPageClient from "@/components/workout/WorkoutPageClient";

export default async function WorkoutPage() {
  const supabase = await createClient();
  const [workoutData, programmesData] = await Promise.all([
    fetchWorkoutPageData(supabase),
    fetchProgrammesData(supabase),
  ]);

  return (
    <WorkoutPageClient
      initialWorkoutData={workoutData}
      initialProgrammesData={programmesData}
    />
  );
}
