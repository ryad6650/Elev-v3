'use client';

import { useState, useCallback } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createRoutine } from '@/app/actions/workout';
import ExerciseSearch from './ExerciseSearch';

interface SelectedExercise {
  exerciseId: string;
  nom: string;
  groupeMusculaire: string;
  seriesCible: number;
  repsCible: number;
  repsCibleMax: number | null;
}

interface RawExercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
}

interface Props {
  onClose: () => void;
}

const GROUPE_COLORS: Record<string, { bg: string; text: string }> = {
  pectoraux: { bg: 'rgba(249,115,22,0.15)', text: '#FB923C' },
  dos: { bg: 'rgba(59,130,246,0.15)', text: '#60A5FA' },
  épaules: { bg: 'rgba(168,85,247,0.15)', text: '#C084FC' },
  epaules: { bg: 'rgba(168,85,247,0.15)', text: '#C084FC' },
  biceps: { bg: 'rgba(20,184,166,0.15)', text: '#2DD4BF' },
  triceps: { bg: 'rgba(236,72,153,0.15)', text: '#F472B6' },
  quadriceps: { bg: 'rgba(234,179,8,0.15)', text: '#FACC15' },
  'ischio-jambiers': { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD' },
  ischios: { bg: 'rgba(59,130,246,0.15)', text: '#93C5FD' },
  fessiers: { bg: 'rgba(244,63,94,0.15)', text: '#FB7185' },
  mollets: { bg: 'rgba(34,197,94,0.15)', text: '#4ADE80' },
  abdominaux: { bg: 'rgba(249,115,22,0.15)', text: '#FB923C' },
  lombaires: { bg: 'rgba(168,85,247,0.15)', text: '#C084FC' },
  'avant-bras': { bg: 'rgba(251,146,60,0.15)', text: '#FB923C' },
};

const DEFAULT_COLOR = { bg: 'rgba(168,162,158,0.15)', text: '#A8A29E' };

function getGroupeColor(groupe: string) {
  return GROUPE_COLORS[groupe.toLowerCase()] ?? DEFAULT_COLOR;
}

export default function CreateRoutineModal({ onClose }: Props) {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [exercices, setExercices] = useState<SelectedExercise[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState('');
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

  const updateSeries = (index: number, delta: number) => {
    setExercices((prev) =>
      prev.map((e, i) => i === index ? { ...e, seriesCible: Math.max(1, e.seriesCible + delta) } : e)
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
    // Nettoyer les repsRaw pour les index décalés
    setRepsRaw((prev) => {
      const next: Record<number, string> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const key = parseInt(k);
        if (key < index) next[key] = v;
        else if (key > index) next[key - 1] = v;
      });
      return next;
    });
  };

  const moveExercice = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= exercices.length) return;
    setExercices((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
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

  const totalSeries = exercices.reduce((s, e) => s + e.seriesCible, 0);
  const groupes = [...new Set(exercices.map((e) => e.groupeMusculaire))];

  return (
    <div
      className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 flex flex-col"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Header avec gradient accent subtil */}
      <div
        className="px-4 pb-5 border-b"
        style={{
          borderColor: 'var(--border)',
          paddingTop: 'max(1.5rem, env(safe-area-inset-top))',
          background: 'linear-gradient(180deg, rgba(232,134,12,0.06) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onClose}
            className="p-2 rounded-xl"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <X size={18} style={{ color: 'var(--text-primary)' }} />
          </button>
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving || !nom.trim()}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-40"
            style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 4px 20px rgba(232,134,12,0.3)' }}
          >
            {saving ? 'Création...' : 'Créer'}
          </button>
        </div>

        {/* Nom — gros input DM Serif */}
        <input
          autoFocus
          type="text"
          value={nom}
          onChange={(e) => { setNom(e.target.value); setErreur(''); }}
          placeholder="Nom de la routine"
          className="w-full text-3xl font-bold bg-transparent outline-none mb-1"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            fontStyle: 'italic',
            color: 'var(--text-primary)',
            fontSize: '16px',
          }}
        />
        {erreur && (
          <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{erreur}</p>
        )}

        {/* Badges groupes musculaires + stats */}
        {exercices.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mt-3">
            {groupes.map((g) => {
              const gColor = getGroupeColor(g);
              return (
                <span
                  key={g}
                  className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full"
                  style={{ background: gColor.bg, color: gColor.text }}
                >
                  {g}
                </span>
              );
            })}
            <span className="text-[11px] ml-auto" style={{ color: 'var(--text-muted)' }}>
              {exercices.length} exo{exercices.length > 1 ? 's' : ''} · {totalSeries} série{totalSeries > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Liste exercices */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {exercices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Dumbbell size={40} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Aucun exercice ajouté
            </p>
          </div>
        )}

        {exercices.map((ex, i) => {
          const gColor = getGroupeColor(ex.groupeMusculaire);
          return (
            <div
              key={`${ex.exerciseId}-${i}`}
              className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
            >
              {/* Barre de couleur en haut */}
              <div className="h-1" style={{ background: gColor.text }} />

              <div className="p-4">
                {/* Header exercice */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: gColor.bg }}
                    >
                      <Dumbbell size={20} style={{ color: gColor.text }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {ex.nom}
                      </p>
                      <p className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {ex.groupeMusculaire}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <div className="flex flex-col">
                      <button
                        onClick={() => moveExercice(i, -1)}
                        disabled={i === 0}
                        className="p-0.5 disabled:opacity-20"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => moveExercice(i, 1)}
                        disabled={i === exercices.length - 1}
                        className="p-0.5 disabled:opacity-20"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <button
                      onClick={() => removeExercice(i)}
                      className="p-1.5 rounded-lg"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Config séries / reps — side by side */}
                <div className="flex gap-3">
                  <div
                    className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Séries
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSeries(i, -1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      >
                        −
                      </button>
                      <span className="text-sm font-bold tabular-nums w-4 text-center" style={{ color: 'var(--accent-text)' }}>
                        {ex.seriesCible}
                      </span>
                      <button
                        onClick={() => updateSeries(i, 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold active:scale-90 transition-transform"
                        style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div
                    className="flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    <span className="text-[10px] uppercase tracking-wide font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Reps
                    </span>
                    <input
                      type="text"
                      value={getRepsDisplay(ex, i)}
                      onChange={(e) => handleRepsChange(i, e.target.value)}
                      onBlur={() => handleRepsBlur(i)}
                      placeholder="10 ou 8-12"
                      className="w-16 text-right text-sm font-bold tabular-nums bg-transparent outline-none"
                      style={{ color: 'var(--accent-text)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FAB Ajouter (floating) — bien cadré au-dessus de la bottom nav */}
      <div
        className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 pt-4"
        style={{ background: 'linear-gradient(transparent, var(--bg-primary) 30%)' }}
      >
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all active:scale-95"
          style={{
            background: 'var(--accent)',
            color: 'white',
            boxShadow: '0 8px 32px rgba(232,134,12,0.4)',
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          Ajouter un exercice
        </button>
      </div>
    </div>
  );
}
