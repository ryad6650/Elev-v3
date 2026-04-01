'use client';

import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import WorkoutHub from './WorkoutHub';
import ActiveWorkout from './ActiveWorkout';
import CreateRoutineModal from './CreateRoutineModal';
import WorkoutProgrammesSection from './WorkoutProgrammesSection';
import { fetchWorkoutPageData, type WorkoutPageData } from '@/lib/workout';
import { fetchProgrammesData, type ProgrammesPageData } from '@/lib/programmes';
import { createClient } from '@/lib/supabase/client';
import { getCached, setCache } from '@/lib/pageCache';

const CACHE_KEY = 'workout';

interface PageData {
  workoutData: WorkoutPageData;
  programmesData: ProgrammesPageData;
}

function getDateFr(): string {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^\w/, (c) => c.toUpperCase());
}

function getLastSessionLabel(historique: WorkoutPageData['historique']): string {
  if (!historique.length) return 'aucune séance récente';
  const diffDays = Math.floor((Date.now() - new Date(historique[0].date).getTime()) / 86400000);
  if (diffDays === 0) return 'dernière séance aujourd\'hui';
  if (diffDays === 1) return 'dernière séance hier';
  return `dernière séance il y a ${diffDays} jours`;
}

function HubLayout({ workoutData, programmesData }: PageData) {
  const startWorkout = useWorkoutStore((s) => s.startWorkout);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <main className="px-4 pt-6 pb-28 page-enter" style={{ maxWidth: 520, margin: '0 auto' }}>

      {/* Header */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {getDateFr()} · {getLastSessionLabel(workoutData.historique)}
          </p>
          <h1
            className="text-3xl leading-tight"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            Séances
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Search size={17} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <Plus size={20} strokeWidth={2.5} style={{ color: 'var(--text-primary)' }} />
          </button>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => startWorkout({ routineId: null, routineName: null })}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(232,134,12,0.35)', color: 'var(--accent-text)' }}
        >
          ⚡ Séance libre
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{ background: 'var(--bg-card)', border: '1px solid rgba(232,134,12,0.35)', color: 'var(--accent-text)' }}
        >
          📋 Programme
        </button>
      </div>

      <WorkoutProgrammesSection data={programmesData} />
      <WorkoutHub data={workoutData} />

      {showCreate && <CreateRoutineModal onClose={() => setShowCreate(false)} />}
    </main>
  );
}

const EMPTY_WORKOUT: WorkoutPageData = { routines: [], historique: [] };
const EMPTY_PROGRAMMES: ProgrammesPageData = { programmes: [], programmeActif: null, routinesDisponibles: [] };

export default function WorkoutPageClient() {
  const cached = getCached<PageData>(CACHE_KEY);
  const [pageData, setPageData] = useState<PageData | null>(cached);
  const [hydrated, setHydrated] = useState(false);
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([fetchWorkoutPageData(supabase), fetchProgrammesData(supabase)])
      .then(([workoutData, programmesData]) => {
        const data = { workoutData, programmesData };
        setPageData(data);
        setCache(CACHE_KEY, data);
      })
      .catch(console.error);
  }, []);

  if (!hydrated || !activeWorkout) {
    return <HubLayout
      workoutData={pageData?.workoutData ?? EMPTY_WORKOUT}
      programmesData={pageData?.programmesData ?? EMPTY_PROGRAMMES}
    />;
  }
  return <ActiveWorkout />;
}
