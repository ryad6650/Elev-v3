import type { Metadata } from "next";
import { Suspense } from "react";
import Loading from "../loading";
import { createClient } from "@/lib/supabase/server";
import { getUserFromMiddleware } from "@/lib/supabase/user";
import { fetchWorkoutPageData } from "@/lib/workout";
import { fetchProgrammesData } from "@/lib/programmes";
import WorkoutPageClient from "@/components/workout/WorkoutPageClient";

export const metadata: Metadata = { title: "Séances — Élev" };

async function WorkoutContent() {
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

export default function WorkoutPage() {
  return (
    <Suspense fallback={<Loading />}>
      <WorkoutContent />
    </Suspense>
  );
}
