'use client';

import { useEffect, useState } from 'react';
import { Plus, Dumbbell, ListPlus } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import WorkoutHub from './WorkoutHub';
import ActiveWorkout from './ActiveWorkout';
import CreateRoutineModal from './CreateRoutineModal';
import WorkoutProgrammesSection from './WorkoutProgrammesSection';
import type { WorkoutPageData } from '@/lib/workout';
import type { ProgrammesPageData } from '@/lib/programmes';

interface Props {
  workoutData: WorkoutPageData;
  programmesData: ProgrammesPageData;
}

function HubLayout({ workoutData, programmesData }: Props) {
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="px-4 pt-6 pb-28 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1
          className="text-3xl leading-tight"
          style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
        >
          Séances
        </h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #A85200 0%, #E8860C 40%, #FFB347 100%)', color: '#fff' }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => startWorkout({ routineId: null, routineName: null })}
          className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(232,134,12,0.35)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(232,134,12,0.12)' }}
          >
            <Dumbbell size={18} style={{ color: 'var(--accent-text)' }} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm" style={{ color: 'var(--accent-text)' }}>Séance libre</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Exercices libres</p>
          </div>
        </button>

        <button
          onClick={() => setShowCreate(true)}
          className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #A85200 0%, #E8860C 40%, #FFB347 100%)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ListPlus size={18} style={{ color: 'white' }} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm" style={{ color: 'white' }}>Nouvelle routine</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Plan structuré</p>
          </div>
        </button>
      </div>

      {/* Programmes */}
      <WorkoutProgrammesSection data={programmesData} />

      {/* Routines */}
      <WorkoutHub data={workoutData} />

      {showCreate && <CreateRoutineModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}

export default function WorkoutPageClient({ workoutData, programmesData }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !activeWorkout) {
    return <HubLayout workoutData={workoutData} programmesData={programmesData} />;
  }
  return <ActiveWorkout />;
}
