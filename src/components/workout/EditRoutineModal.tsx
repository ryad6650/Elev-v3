'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { updateRoutine, getRoutineExercises } from '@/app/actions/workout';
import ExerciseSearch from './ExerciseSearch';
import type { Routine } from '@/lib/workout';

interface ExerciceEdite {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
}

interface RawExercise { id: string; nom: string; groupe_musculaire: string }

interface Props {
  routine: Routine;
  onClose: () => void;
}

export default function EditRoutineModal({ routine, onClose }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState(routine.nom);
  const [exercices, setExercices] = useState<ExerciceEdite[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    getRoutineExercises(routine.id)
      .then((data) => setExercices(data.map((e) => ({
        exerciseId: e.exerciseId, nom: e.nom, groupeMusculaire: e.groupeMusculaire,
        seriesCible: e.seriesCible, repsCible: e.repsCible, repsCibleMax: e.repsCibleMax,
      }))))
      .finally(() => setLoading(false));
  }, [routine.id]);

  const handleSelectExercise = (ex: RawExercise) => {
    setExercices((prev) => [...prev, {
      exerciseId: ex.id, nom: ex.nom, groupeMusculaire: ex.groupe_musculaire,
      seriesCible: 3, repsCible: 10, repsCibleMax: null,
    }]);
    setShowSearch(false);
  };

  const update = (i: number, field: keyof ExerciceEdite, val: number | null) =>
    setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));

  const handleRepsBlur = (i: number, raw: string) => {
    const rangeMatch = raw.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]), max = parseInt(rangeMatch[2]);
      if (min >= 1 && max > min) {
        setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, repsCible: min, repsCibleMax: max } : e));
      }
    } else {
      const n = parseInt(raw);
      if (!isNaN(n) && n >= 1) setExercices((prev) => prev.map((e, idx) => idx === i ? { ...e, repsCible: n, repsCibleMax: null } : e));
    }
  };

  const handleSave = async () => {
    if (!nom.trim()) { setErreur('Donne un nom à ta routine.'); return; }
    setSaving(true);
    try {
      await updateRoutine(routine.id, nom.trim(), exercices.map((e, i) => ({
        exerciseId: e.exerciseId, seriesCible: e.seriesCible,
        repsCible: e.repsCible, repsCibleMax: e.repsCibleMax, ordre: i,
      })));
      router.refresh();
      onClose();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur inattendue');
      setSaving(false);
    }
  };

  if (showSearch) return <ExerciseSearch onClose={() => setShowSearch(false)} onSelect={handleSelectExercise} />;

  return (
    <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <div className="flex items-center gap-3 px-4 pb-4 border-b" style={{ borderColor: 'var(--border)', paddingTop: 'max(1.5rem, env(safe-area-inset-top))' }}>
        <button onClick={onClose} className="p-2 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <X size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <h2 className="flex-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Modifier la routine</h2>
        <button onClick={handleSave} disabled={saving || !nom.trim()} className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-40" style={{ background: 'var(--accent)', color: 'white' }}>
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 space-y-5 pb-24">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Nom</label>
          <input type="text" value={nom} onChange={(e) => { setNom(e.target.value); setErreur(''); }}
            className="w-full px-4 py-3 rounded-xl outline-none text-sm"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          />
          {erreur && <p className="text-xs mt-1.5" style={{ color: 'var(--danger)' }}>{erreur}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
            Exercices {exercices.length > 0 && `(${exercices.length})`}
          </label>
          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Chargement...</p>
          ) : (
            <div className="space-y-2">
              {exercices.map((ex, i) => (
                <div key={`${ex.exerciseId}-${i}`} className="p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{ex.nom}</p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--text-muted)' }}>{ex.groupeMusculaire}</p>
                    </div>
                    <button onClick={() => setExercices((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg ml-2 shrink-0" style={{ color: 'var(--danger)' }}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex items-end gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Séries</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => update(i, 'seriesCible', Math.max(1, ex.seriesCible - 1))} className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>−</button>
                        <span className="w-6 text-center font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{ex.seriesCible}</span>
                        <button onClick={() => update(i, 'seriesCible', ex.seriesCible + 1)} className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>+</button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>Reps</p>
                      <input type="text" inputMode="numeric"
                        defaultValue={ex.repsCibleMax ? `${ex.repsCible}-${ex.repsCibleMax}` : `${ex.repsCible}`}
                        onBlur={(e) => handleRepsBlur(i, e.target.value)} placeholder="10 ou 8-12"
                        className="w-full px-3 py-1.5 rounded-xl text-sm font-semibold text-center outline-none"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setShowSearch(true)} className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
            <Plus size={16} />Ajouter un exercice
          </button>
        </div>
      </div>
    </div>
  );
}
