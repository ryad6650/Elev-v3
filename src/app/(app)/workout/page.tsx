import { fetchWorkoutPageData } from '@/lib/workout';
import WorkoutPageClient from '@/components/workout/WorkoutPageClient';

export default async function WorkoutPage() {
  let data;
  try {
    data = await fetchWorkoutPageData();
  } catch {
    data = { routines: [], historique: [] };
  }

  return <WorkoutPageClient data={data} />;
}
