'use client';

import { Check } from 'lucide-react';
import type { WorkoutSet } from '@/store/workoutStore';

interface Props {
  set: WorkoutSet;
  isActive: boolean;
  onUpdate: (field: 'reps' | 'poids', value: number | null) => void;
  onToggle: () => void;
}

export default function SetRow({ set, isActive, onUpdate, onToggle }: Props) {
  const repsPlaceholder = set.repsCible > 0
    ? (set.repsCibleMax ? `${set.repsCible}-${set.repsCibleMax}` : `${set.repsCible}`)
    : '—';

  const precStr = set.poidsRef != null
    ? (set.repsRef != null ? `${set.poidsRef}×${set.repsRef}` : `${set.poidsRef}kg`)
    : '—';

  const inputBorder = isActive
    ? '1.5px solid var(--accent)'
    : '1.5px solid var(--border)';

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
      style={{ background: set.completed ? 'rgba(34,197,94,0.06)' : 'transparent' }}
    >
      {/* Numéro ou ✓ gauche */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0">
        {set.completed ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'var(--success)' }}
          >
            <Check size={11} strokeWidth={3} color="white" />
          </div>
        ) : (
          <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
            {set.numSerie}
          </span>
        )}
      </div>

      {/* Poids et Reps — même taille flex-1 chacun */}
      <div className="flex flex-1 gap-2">
        {/* Poids */}
        <div className="relative flex-1">
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            placeholder={set.poidsRef != null ? `${set.poidsRef}` : '0'}
            value={set.poids ?? ''}
            onChange={(e) => onUpdate('poids', e.target.value === '' ? null : Number(e.target.value))}
            className="w-full text-center text-sm font-semibold rounded-xl py-1.5 pl-1 pr-6 outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: inputBorder }}
          />
          <span
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] pointer-events-none select-none"
            style={{ color: 'var(--text-muted)' }}
          >
            kg
          </span>
        </div>

        {/* Reps */}
        <div className="flex-1">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder={repsPlaceholder}
            value={set.reps ?? ''}
            onChange={(e) => onUpdate('reps', e.target.value === '' ? null : Number(e.target.value))}
            className="w-full text-center text-sm font-semibold rounded-xl py-1.5 outline-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: inputBorder }}
          />
        </div>
      </div>

      {/* Précédent */}
      <div className="w-11 text-center shrink-0">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{precStr}</span>
      </div>

      {/* Bouton valider */}
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          background: set.completed ? 'var(--success)' : 'transparent',
          color: set.completed ? 'white' : 'var(--text-muted)',
          border: set.completed ? 'none' : '1.5px solid var(--border)',
        }}
      >
        <Check size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
}
