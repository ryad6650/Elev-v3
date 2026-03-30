'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import type { WorkoutExercise } from '@/store/workoutStore';
import SetRow from './SetRow';

interface Props {
  exercise: WorkoutExercise;
}

export default function ExerciseCard({ exercise }: Props) {
  const addSet = useWorkoutStore((s) => s.addSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const toggleComplete = useWorkoutStore((s) => s.toggleComplete);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);

  const completedCount = exercise.sets.filter((s) => s.completed).length;
  const allDone = exercise.sets.length > 0 && completedCount === exercise.sets.length;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
    >
      {/* En-tête exercice */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3">
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            {exercise.nom}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {exercise.groupeMusculaire}
            {' · '}
            <span style={{ color: allDone ? 'var(--success)' : 'var(--text-muted)' }}>
              {completedCount}/{exercise.sets.length} séries
            </span>
          </p>
        </div>
        <button
          onClick={() => removeExercise(exercise.uid)}
          className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--danger)' }}
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* En-têtes colonnes */}
      <div className="flex items-center gap-2 px-3 pb-1">
        <span className="w-5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>#</span>
        <span className="w-10 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Cible</span>
        <span className="flex-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>Reps</span>
        <span className="flex-1 text-center text-xs" style={{ color: 'var(--text-muted)' }}>kg</span>
        <span className="w-9 text-center text-xs" style={{ color: 'var(--text-muted)' }}>✓</span>
      </div>

      {/* Lignes de séries */}
      <div className="px-1 pb-1 space-y-0.5">
        {exercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            onUpdate={(field, value) => updateSet(exercise.uid, set.id, field, value)}
            onToggle={() => toggleComplete(exercise.uid, set.id)}
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
