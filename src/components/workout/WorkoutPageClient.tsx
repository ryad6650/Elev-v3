'use client';

import { useEffect, useState } from 'react';
import { Plus, Dumbbell, ListPlus } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import WorkoutHub from './WorkoutHub';
import ActiveWorkout from './ActiveWorkout';
import CreateRoutineModal from './CreateRoutineModal';
import type { WorkoutPageData } from '@/lib/workout';

interface Props {
  data: WorkoutPageData;
}

function StartSheet({ onFree, onCreate, onClose }: {
  onFree: () => void;
  onCreate: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center pb-[140px] px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] px-4 pb-5 pt-5 space-y-3"
        style={{ background: 'var(--bg-card)', borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFree}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(232,134,12,0.15)' }}
          >
            <Dumbbell size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Séance libre
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Choisis tes exercices au fur et à mesure
            </p>
          </div>
        </button>

        <button
          onClick={onCreate}
          className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all active:scale-[0.98]"
          style={{ background: 'var(--accent)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <ListPlus size={20} style={{ color: 'white' }} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'white' }}>
              Nouvelle routine
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Crée une séance réutilisable avec exercices et séries cibles
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}

function HubLayout({ data }: { data: WorkoutPageData }) {
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [showSheet, setShowSheet] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleStartFree = () => {
    setShowSheet(false);
    startWorkout({ routineId: null, routineName: null });
  };

  return (
    <main className="px-4 pt-6 pb-24 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-3xl leading-tight"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
          }}
        >
          Séances
        </h1>
        <button
          onClick={() => setShowSheet(true)}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: 'var(--accent)', color: '#fff' }}
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>

      <WorkoutHub data={data} />

      {showSheet && (
        <StartSheet
          onFree={handleStartFree}
          onCreate={() => { setShowSheet(false); setShowCreate(true); }}
          onClose={() => setShowSheet(false)}
        />
      )}

      {showCreate && <CreateRoutineModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}

export default function WorkoutPageClient({ data }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  useEffect(() => setHydrated(true), []);

  if (!hydrated || !activeWorkout) return <HubLayout data={data} />;
  return <ActiveWorkout />;
}
