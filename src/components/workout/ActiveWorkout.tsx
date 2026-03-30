'use client';

import { useState } from 'react';
import { ChevronLeft, Plus, Pause, Play, X } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import ExerciseCard from './ExerciseCard';
import ExerciseSearch from './ExerciseSearch';
import WorkoutTimer from './WorkoutTimer';
import RestTimer from './RestTimer';
import WorkoutSummary from './WorkoutSummary';

interface PRNotif {
  exerciseName: string;
  poids: number;
  reps: number;
}

export default function ActiveWorkout() {
  const activeWorkout = useWorkoutStore((s) => s.activeWorkout);
  const clearWorkout = useWorkoutStore((s) => s.clearWorkout);
  const [showSearch, setShowSearch] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [prNotif, setPrNotif] = useState<PRNotif | null>(null);
  // UID de l'exercice actuellement ouvert (accordéon)
  const [openUid, setOpenUid] = useState<string | null>(
    () => activeWorkout?.exercises[0]?.uid ?? null
  );

  if (!activeWorkout) return null;
  if (showSummary) return <WorkoutSummary workout={activeWorkout} />;

  const isPaused = pausedAt !== null;
  const handlePause = () => setPausedAt(Date.now());
  const handleResume = () => {
    if (!pausedAt) return;
    setTotalPausedMs((prev) => prev + Date.now() - pausedAt);
    setPausedAt(null);
  };

  return (
    <>
      <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg-primary)' }}>

        {/* Header sticky */}
        <div
          className="sticky top-0 z-30 px-4 pb-3"
          style={{ background: 'var(--bg-primary)', paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
        >
          {/* Titre */}
          <div className="flex items-start gap-2 mb-3">
            <button
              onClick={() => setShowCancel(true)}
              className="p-1 rounded-lg mt-1.5 shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronLeft size={22} />
            </button>
            <div>
              <p
                className="text-[10px] uppercase tracking-widest font-semibold"
                style={{ color: 'var(--accent)' }}
              >
                {activeWorkout.routineName ?? 'Séance libre'}
              </p>
              <h1
                className="text-[2rem] leading-tight italic"
                style={{ fontFamily: 'var(--font-dm-serif)', color: 'var(--text-primary)' }}
              >
                En cours...
              </h1>
            </div>
          </div>

          {/* Card timer — même fond que les cards exercice */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-2xl"
            style={{ background: 'var(--bg-secondary)' }}
          >
            <div>
              <WorkoutTimer
                startedAt={activeWorkout.debutAt}
                pausedAt={pausedAt}
                totalPausedMs={totalPausedMs}
                large
              />
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Durée séance</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={isPaused ? handleResume : handlePause}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                }}
              >
                {isPaused ? <Play size={13} fill="currentColor" /> : <Pause size={13} />}
                {isPaused ? 'Reprendre' : 'Pause'}
              </button>
              <button
                onClick={() => setShowSummary(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--accent)',
                  borderColor: 'var(--border)',
                }}
              >
                Fin
              </button>
            </div>
          </div>
        </div>

        {/* Exercices (accordéon) */}
        <div className="flex-1 px-4 py-4 space-y-2 pb-36">
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
          {activeWorkout.exercises.map((ex, idx) => (
            <ExerciseCard
              key={ex.uid}
              exercise={ex}
              exerciseIndex={idx}
              isOpen={openUid === ex.uid}
              onOpen={() => setOpenUid(ex.uid)}
              onPR={(name, poids, reps) => setPrNotif({ exerciseName: name, poids, reps })}
            />
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

        {/* Bannière PR */}
        {prNotif && (
          <div
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 w-[calc(100%-2rem)] max-w-sm flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl"
            style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.3)' }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
              style={{ background: 'rgba(234,179,8,0.2)' }}
            >
              💪
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#FDE68A' }}>
                PR sur {prNotif.exerciseName} !
              </p>
              <p className="text-xs" style={{ color: '#CA8A04' }}>
                {prNotif.poids}kg × {prNotif.reps} reps — nouveau record
              </p>
            </div>
            <button onClick={() => setPrNotif(null)} className="p-1 shrink-0" style={{ color: '#CA8A04' }}>
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {showSearch && <ExerciseSearch onClose={() => setShowSearch(false)} />}
      <RestTimer />

      {/* Confirmation abandon */}
      {showCancel && (
        <div
          className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex items-end justify-center pb-8 px-4"
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
