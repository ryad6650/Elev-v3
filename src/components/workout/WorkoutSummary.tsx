'use client';

import { useState } from 'react';
import { Trophy, Clock, Zap, Check } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';
import type { ActiveWorkout } from '@/store/workoutStore';
import { saveWorkout } from '@/app/actions/workout';

interface Props {
  workout: ActiveWorkout;
}

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  return `${m} min`;
}

export default function WorkoutSummary({ workout }: Props) {
  const clearWorkout = useWorkoutStore((s) => s.clearWorkout);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const duration = Date.now() - workout.debutAt;
  const completedSets = workout.exercises.flatMap((e) => e.sets.filter((s) => s.completed));
  const volume = completedSets.reduce((acc, s) => acc + (s.poids ?? 0) * (s.reps ?? 0), 0);
  const exercicesRealises = workout.exercises.filter((e) => e.sets.some((s) => s.completed));

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveWorkout(workout.exercises, workout.debutAt, workout.routineId);
      setSaved(true);
      setTimeout(() => clearWorkout(), 1500);
    } catch {
      setSaving(false);
      alert('Erreur lors de la sauvegarde. Réessaie.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4 overflow-y-auto"
      style={{ background: 'var(--bg-primary)' }}
    >
      <div className="w-full max-w-sm space-y-5 py-8">
        {/* Titre */}
        <div className="text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--accent-bg)' }}
          >
            <Trophy size={32} style={{ color: 'var(--accent)' }} />
          </div>
          <h2
            className="text-2xl leading-tight"
            style={{ fontFamily: 'var(--font-dm-serif)', fontStyle: 'italic', color: 'var(--text-primary)' }}
          >
            Séance terminée !
          </h2>
          {workout.routineName && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {workout.routineName}
            </p>
          )}
        </div>

        {/* Stats durée + volume */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="p-4 rounded-2xl border text-center"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Clock size={20} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
            <p className="text-xl font-bold" style={{ color: 'var(--accent-text)' }}>
              {formatDuration(duration)}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Durée</p>
          </div>
          <div
            className="p-4 rounded-2xl border text-center"
            style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
          >
            <Zap size={20} className="mx-auto mb-1" style={{ color: 'var(--accent)' }} />
            <p className="text-xl font-bold" style={{ color: 'var(--accent-text)' }}>
              {volume > 0 ? `${Math.round(volume)} kg` : '—'}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Volume</p>
          </div>
        </div>

        {/* Exercices réalisés */}
        {exercicesRealises.length > 0 && (
          <div className="space-y-2">
            {exercicesRealises.map((ex) => {
              const done = ex.sets.filter((s) => s.completed).length;
              return (
                <div
                  key={ex.uid}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border"
                  style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {ex.nom}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {ex.groupeMusculaire}
                    </p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                    {done} série{done > 1 ? 's' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all"
            style={{
              background: saved ? 'var(--success)' : 'var(--accent)',
              color: 'white',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saved ? <><Check size={18} /> Enregistré !</> : saving ? 'Sauvegarde...' : 'Enregistrer la séance'}
          </button>
          <button
            onClick={clearWorkout}
            className="w-full py-3 rounded-2xl text-sm font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            Ignorer
          </button>
        </div>
      </div>
    </div>
  );
}
