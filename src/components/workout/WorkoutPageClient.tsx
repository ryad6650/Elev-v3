'use client';

import { useEffect, useState } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import WorkoutHub from './WorkoutHub';
import ActiveWorkout from './ActiveWorkout';
import type { WorkoutPageData } from '@/lib/workout';

interface Props {
  data: WorkoutPageData;
}

function HubLayout({ data }: { data: WorkoutPageData }) {
  return (
    <main className="px-4 pt-6 pb-4 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>
      <h1
        className="text-3xl leading-tight mb-6"
        style={{
          fontFamily: 'var(--font-dm-serif)',
          fontStyle: 'italic',
          color: 'var(--text-primary)',
        }}
      >
        Séances
      </h1>
      <WorkoutHub data={data} />
    </main>
  );
}

export default function WorkoutPageClient({ data }: Props) {
  // Attendre la réhydratation Zustand pour éviter le flash
  const [hydrated, setHydrated] = useState(false);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !activeWorkout) return <HubLayout data={data} />;
  return <ActiveWorkout />;
}
