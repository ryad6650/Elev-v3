import { fetchWorkoutPageData, type WorkoutPageData } from '@/lib/workout';
import { fetchProgrammesData, type ProgrammesPageData } from '@/lib/programmes';
import WorkoutPageClient from '@/components/workout/WorkoutPageClient';

export default async function WorkoutPage() {
  const workoutData: WorkoutPageData = await fetchWorkoutPageData().catch(
    (): WorkoutPageData => ({ routines: [], historique: [] })
  );
  const programmesData: ProgrammesPageData = await fetchProgrammesData().catch(
    (): ProgrammesPageData => ({ programmes: [], programmeActif: null, routinesDisponibles: [] })
  );

  return <WorkoutPageClient workoutData={workoutData} programmesData={programmesData} />;
}
