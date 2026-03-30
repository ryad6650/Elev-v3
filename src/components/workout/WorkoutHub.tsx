'use client';

import { Dumbbell, ChevronRight, History } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import WorkoutHistoryCard from './WorkoutHistoryCard';
import type { WorkoutPageData, Routine } from '@/lib/workout';

interface Props {
  data: WorkoutPageData;
  onAddExercise?: () => void;
}

export default function WorkoutHub({ data, onAddExercise }: Props) {
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  const handleStartFree = () => {
    startWorkout({ routineId: null, routineName: null });
    onAddExercise?.();
  };

  const handleStartRoutine = (routine: Routine) => {
    startWorkout({ routineId: routine.id, routineName: routine.nom });
  };

  return (
    <div className="space-y-6">
      {/* CTA séance libre */}
      <button
        onClick={handleStartFree}
        className="w-full flex items-center justify-between p-5 rounded-2xl transition-all active:scale-[0.98]"
        style={{ background: 'var(--accent)', color: 'white' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            <Dumbbell size={20} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-base">Séance libre</p>
            <p className="text-xs mt-0.5" style={{ opacity: 0.8 }}>
              Choisis tes exercices librement
            </p>
          </div>
        </div>
        <ChevronRight size={20} style={{ opacity: 0.8 }} />
      </button>

      {/* Programmes */}
      {data.routines.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Mes programmes
          </p>
          <div className="space-y-2">
            {data.routines.map((routine) => (
              <button
                key={routine.id}
                onClick={() => handleStartRoutine(routine)}
                className="w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all active:scale-[0.99]"
                style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {routine.nom}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {routine.exercisesCount} exercice{routine.exercisesCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Historique récent */}
      {data.historique.length > 0 && (
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}
          >
            <History size={13} />
            Séances récentes
          </p>
          <div className="space-y-3">
            {data.historique.map((w) => (
              <WorkoutHistoryCard key={w.id} workout={w} />
            ))}
          </div>
        </div>
      )}

      {data.routines.length === 0 && data.historique.length === 0 && (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Démarre ta première séance pour commencer ton suivi.
          </p>
        </div>
      )}
    </div>
  );
}
