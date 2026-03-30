'use client';

import { Check } from 'lucide-react';
import type { WorkoutSet } from '@/store/workoutStore';

interface Props {
  set: WorkoutSet;
  onUpdate: (field: 'reps' | 'poids', value: number | null) => void;
  onToggle: () => void;
}

export default function SetRow({ set, onUpdate, onToggle }: Props) {
  const inputStyle = {
    background: 'var(--bg-elevated)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200"
      style={{ background: set.completed ? 'var(--accent-bg)' : 'transparent' }}
    >
      {/* Numéro de série */}
      <span className="w-5 text-center text-sm font-semibold shrink-0" style={{ color: 'var(--text-muted)' }}>
        {set.numSerie}
      </span>

      {/* Cible reps */}
      <span className="w-10 text-center text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
        {set.repsCible > 0 ? `×${set.repsCible}` : '—'}
      </span>

      {/* Reps */}
      <input
        type="number"
        inputMode="numeric"
        min={0}
        placeholder="Reps"
        value={set.reps ?? ''}
        onChange={(e) => onUpdate('reps', e.target.value === '' ? null : Number(e.target.value))}
        className="flex-1 text-center text-sm font-semibold rounded-lg py-2 outline-none min-w-0"
        style={inputStyle}
      />

      {/* Poids */}
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step={0.5}
        placeholder={set.poidsRef != null ? `${set.poidsRef}` : 'kg'}
        value={set.poids ?? ''}
        onChange={(e) => onUpdate('poids', e.target.value === '' ? null : Number(e.target.value))}
        className="flex-1 text-center text-sm font-semibold rounded-lg py-2 outline-none min-w-0"
        style={inputStyle}
      />

      {/* Bouton valider */}
      <button
        onClick={onToggle}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          background: set.completed ? 'var(--success)' : 'var(--bg-elevated)',
          color: set.completed ? 'white' : 'var(--text-muted)',
          border: set.completed ? 'none' : '1px solid var(--border)',
        }}
      >
        <Check size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}
