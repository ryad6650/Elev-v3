'use client';

import { useState } from 'react';
import { X, Plus, CheckCircle2 } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import ExerciseCard from './ExerciseCard';
import ExerciseSearch from './ExerciseSearch';
import WorkoutTimer from './WorkoutTimer';
import RestTimer from './RestTimer';
import WorkoutSummary from './WorkoutSummary';

export default function ActiveWorkout() {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const clearWorkout = useWorkoutStore((s) => s.clearWorkout);
  const [showSearch, setShowSearch] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  if (!activeWorkout) return null;
  if (showSummary) return <WorkoutSummary workout={activeWorkout} />;

  return (
    <>
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>

        {/* Header fixe */}
        <div
          className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'var(--bg-primary)', borderColor: 'var(--border)' }}
        >
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider truncate" style={{ color: 'var(--text-muted)' }}>
              {activeWorkout.routineName ?? 'Séance libre'}
            </p>
            <WorkoutTimer startedAt={activeWorkout.debutAt} />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <CheckCircle2 size={15} />
              Terminer
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="p-2 rounded-xl"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 px-4 py-4 space-y-4 pb-32">
          {activeWorkout.exercises.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Aucun exercice pour le moment.
              </p>
              <button
                onClick={() => setShowSearch(true)}
                className="px-6 py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Ajouter un exercice
              </button>
            </div>
          )}

          {activeWorkout.exercises.map((ex) => (
            <ExerciseCard key={ex.uid} exercise={ex} />
          ))}
        </div>

        {/* FAB ajouter exercice */}
        {activeWorkout.exercises.length > 0 && (
          <div className="fixed bottom-24 right-4 z-20">
            <button
              onClick={() => setShowSearch(true)}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'var(--accent)', color: 'white' }}
            >
              <Plus size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Overlay recherche exercice */}
      {showSearch && <ExerciseSearch onClose={() => setShowSearch(false)} />}

      {/* Timer de repos */}
      <RestTimer />

      {/* Confirmation abandon */}
      {showCancel && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowCancel(false)}
        >
          <div
            className="w-full max-w-sm p-6 rounded-2xl space-y-4"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Abandonner la séance ?
            </p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Les données non enregistrées seront perdues.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancel(false)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold border"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
              >
                Continuer
              </button>
              <button
                onClick={() => { clearWorkout(); setShowCancel(false); }}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--danger)', color: 'white' }}
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
