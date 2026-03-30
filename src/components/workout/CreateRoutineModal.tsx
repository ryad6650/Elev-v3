'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createRoutine } from '@/app/actions/workout';
import ExerciseSearch from './ExerciseSearch';

interface SelectedExercise {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null; // null = chiffre unique, nombre = max de la fourchette
}

interface RawExercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
}

interface Props {
  onClose: () => void;
}

function Stepper({ value, onChange, min = 1 }: { value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
      >
        −
      </button>
      <span className="w-6 text-center font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
        style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
      >
        +
      </button>
    </div>
  );
}

export default function CreateRoutineModal({ onClose }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [exercices, setExercices] = useState<SelectedExercise[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');
  // Stocke la saisie brute pendant l'édition (avant parsing)
  const [repsRaw, setRepsRaw] = useState<Record<number, string>>({});

  const handleSelectExercise = useCallback((ex: RawExercise) => {
    setExercices((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        nom: ex.nom,
        groupeMusculaire: ex.groupe_musculaire,
        seriesCible: 3,
        repsCible: 10,
        repsCibleMax: null,
      },
    ]);
    setShowSearch(false);
  }, []);

  const updateExercice = (index: number, field: keyof SelectedExercise, value: number | null) => {
    setExercices((prev) =>
      prev.map((e, i) => (i === index ? { ...e, [field]: value } : e))
    );
  };

  const getRepsDisplay = (ex: SelectedExercise, i: number): string => {
    if (repsRaw[i] !== undefined) return repsRaw[i];
    return ex.repsCibleMax !== null ? `${ex.repsCible}-${ex.repsCibleMax}` : `${ex.repsCible}`;
  };

  const handleRepsChange = (i: number, raw: string) => {
    setRepsRaw((prev) => ({ ...prev, [i]: raw }));
  };

  const handleRepsBlur = (i: number) => {
    const raw = (repsRaw[i] ?? '').trim();
    const rangeMatch = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);
      if (min >= 1 && max > min) {
        setExercices((prev) =>
          prev.map((e, idx) => idx === i ? { ...e, repsCible: min, repsCibleMax: max } : e)
        );
      }
    } else {
      const num = parseInt(raw);
      if (!isNaN(num) && num >= 1) {
        setExercices((prev) =>
          prev.map((e, idx) => idx === i ? { ...e, repsCible: num, repsCibleMax: null } : e)
        );
      }
    }
    setRepsRaw((prev) => { const next = { ...prev }; delete next[i]; return next; });
  };

  const removeExercice = (index: number) => {
    setExercices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!nom.trim()) { setErreur('Donne un nom à ta routine.'); return; }
    setSaving(true);
    try {
      await createRoutine(
        nom.trim(),
        exercices.map((e, i) => ({
          exerciseId: e.exerciseId,
          seriesCible: e.seriesCible,
          repsCible: e.repsCible,
          repsCibleMax: e.repsCibleMax,
          ordre: i,
        }))
      );
      router.refresh();
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur inattendue');
      setSaving(false);
    }
  };

  if (showSearch) {
    return <ExerciseSearch onClose={() => setShowSearch(false)} onSelect={handleSelectExercise} />;
  }

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pb-4 border-b"
        style={{ borderColor: 'var(--border)', paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <X size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <h2 className="flex-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Nouvelle routine
        </h2>
        <button
          onClick={handleSave}
          disabled={saving || !nom.trim()}
          className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'white' }}
        >
          {saving ? 'Création...' : 'Créer'}
        </button>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto px-4 pt-5 space-y-5 pb-24">
        {/* Nom */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            Nom de la routine
          </label>
          <input
            autoFocus
            type="text"
            placeholder="Ex : Push A, Full Body, Jambes..."
            value={nom}
            onChange={(e) => { setNom(e.target.value); setErreur(''); }}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
          {erreur && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{erreur}</p>
          )}
        </div>

        {/* Exercices */}
        <div>
          <label
            className="block text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Exercices {exercices.length > 0 && `(${exercices.length})`}
          </label>

          <div className="space-y-2">
            {exercices.map((ex, i) => (
              <div
                key={`${ex.exerciseId}-${i}`}
                className="p-4 rounded-2xl"
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
              >
                {/* Nom + supprimer */}
                <div className="flex items-start justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                      {ex.nom}
                    </p>
                    <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>
                      {ex.groupeMusculaire}
                    </p>
                  </div>
                  <button
                    onClick={() => removeExercice(i)}
                    className="p-1.5 rounded-lg ml-2 shrink-0"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Séries + reps */}
                <div className="flex items-end gap-4">
                  {/* Séries */}
                  <div>
                    <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Séries
                    </p>
                    <Stepper
                      value={ex.seriesCible}
                      onChange={(v) => updateExercice(i, 'seriesCible', v)}
                    />
                  </div>

                  {/* Reps */}
                  <div className="flex-1">
                    <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
                      Reps
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={getRepsDisplay(ex, i)}
                      onChange={(e) => handleRepsChange(i, e.target.value)}
                      onBlur={() => handleRepsBlur(i)}
                      placeholder="10 ou 8-12"
                      className="w-full px-3 py-1.5 rounded-xl text-sm font-semibold text-center outline-none transition-colors"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                      }}
                    />
                    <p className="text-[10px] mt-1 text-center" style={{ color: 'var(--text-muted)' }}>
                      ex : 10 ou 8-12
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton ajouter */}
          <button
            onClick={() => setShowSearch(true)}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border-2 border-dashed transition-opacity active:opacity-70"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
          >
            <Plus size={16} />
            Ajouter un exercice
          </button>
        </div>
      </div>
    </div>
  );
}
