'use client';

import { Plus, ChevronRight, Check } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import type { WorkoutExercise, WorkoutSet } from '@/store/workoutStore';
import SetRow from './SetRow';

interface Props {
  exercise: WorkoutExercise;
  exerciseIndex: number;
  isOpen: boolean;
  onOpen: () => void;
  onPR?: (exerciseName: string, poids: number, reps: number) => void;
}

/** Calcule 3 séries d'échauffement : 50%×12, 70%×6, 85%×3 (arrondi au 0.5 kg) */
function calcWarmup(poids: number) {
  return [
    { pct: 0.5, reps: 12 },
    { pct: 0.7, reps: 6 },
    { pct: 0.85, reps: 3 },
  ].map(({ pct, reps }) => ({
    poids: Math.round(poids * pct * 2) / 2,
    reps,
  }));
}

export default function ExerciseCard({ exercise, exerciseIndex, isOpen, onOpen, onPR }: Props) {
  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleComplete = useWorkoutStore((s) => s.toggleComplete);

  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const allDone = exercise.sets.length > 0 && completedCount === exercise.sets.length;
  const firstIncompleteIdx = exercise.sets.findIndex((s) => !s.completed);

  const workingWeight = exercise.sets[0]?.poids ?? exercise.sets[0]?.poidsRef;
  const warmup = workingWeight && workingWeight >= 20 ? calcWarmup(workingWeight) : null;

  const handleToggle = (set: WorkoutSet) => {
    if (!set.completed && set.poids && set.reps && set.poidsRef && set.poids > set.poidsRef) {
      onPR?.(exercise.nom, set.poids, set.reps);
    }
    toggleComplete(exercise.uid, set.id);
  };

  // Vue condensée (exercice fermé)
  if (!isOpen) {
    return (
      <button
        onClick={onOpen}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-opacity active:opacity-70"
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
      >
        {/* Badge numéro ou ✓ */}
        {allDone ? (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--success)' }}
          >
            <Check size={13} strokeWidth={3} color="white" />
          </div>
        ) : (
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
          >
            {exerciseIndex + 1}
          </div>
        )}

        <span className="flex-1 font-semibold text-sm" style={{ color: allDone ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
          {exercise.nom}
        </span>

        {allDone ? (
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
            style={{ background: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}
          >
            Terminé
          </span>
        ) : (
          <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
            {completedCount}/{exercise.sets.length} séries
          </span>
        )}

        <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
      </button>
    );
  }

  // Vue ouverte (exercice actif, bordure orange)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--bg-secondary)',
        border: '1.5px solid var(--accent)',
      }}
    >
      {/* En-tête exercice */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {exerciseIndex + 1}
        </div>
        <span className="flex-1 font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
          {exercise.nom}
        </span>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ background: 'rgba(59,130,246,0.15)', color: '#93C5FD' }}
        >
          {exercise.groupeMusculaire}
        </span>
      </div>

      {/* Barre échauffement */}
      {warmup && (
        <div
          className="mx-4 mb-2 px-3 py-2 rounded-xl text-xs font-medium"
          style={{ background: 'rgba(232,134,12,0.18)', color: '#FDBA74' }}
        >
          🔥 Échauffement : {warmup.map((w) => `${w.poids}kg×${w.reps}`).join(' · ')}
        </div>
      )}

      {/* En-têtes colonnes */}
      <div className="flex items-center gap-2 px-3 pb-1">
        <span className="w-6 text-center" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>#</span>
        <div className="flex flex-1 gap-2">
          <span className="flex-1 text-center" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>POIDS</span>
          <span className="flex-1 text-center" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>REPS</span>
        </div>
        <span className="w-11 text-center" style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em' }}>PRÉC.</span>
        <span className="w-8" />
      </div>

      {/* Lignes séries */}
      <div className="px-1 pb-1 space-y-0.5">
        {exercise.sets.map((set, idx) => (
          <SetRow
            key={set.id}
            set={set}
            isActive={idx === firstIncompleteIdx}
            onUpdate={(field, value) => updateSet(exercise.uid, set.id, field, value)}
            onToggle={() => handleToggle(set)}
          />
        ))}
      </div>

      {/* Ajouter une série */}
      <button
        onClick={() => addSet(exercise.uid)}
        className="w-full flex items-center justify-center gap-1.5 py-3 text-sm border-t transition-opacity hover:opacity-70"
        style={{ color: 'var(--accent)', borderColor: 'var(--border)' }}
      >
        <Plus size={15} />
        Ajouter une série
      </button>
    </div>
  );
}
