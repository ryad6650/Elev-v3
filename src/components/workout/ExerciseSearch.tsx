'use client';

import { useState, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { useWorkoutStore } from '@/store/workoutStore';

interface Exercise {
  id: string;
  nom: string;
  groupe_musculaire: string;
  equipement: string | null;
}

interface Props {
  onClose: () => void;
}

const GROUPES = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps',
  'Abdominaux', 'Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets',
];

export default function ExerciseSearch({ onClose }: Props) {
  const [q, setQ] = useState('');
  const [groupe, setGroupe] = useState('');
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const addExercise = useWorkoutStore((s) => s.addExercise);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (groupe) params.set('groupe', groupe);
    setLoading(true);
    fetch(`/api/exercises?${params}`)
      .then((r) => r.json())
      .then((data: Exercise[]) => setResults(Array.isArray(data) ? data : []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [q, groupe]);

  const handleAdd = (ex: Exercise) => {
    addExercise({
      exerciseId: ex.id,
      nom: ex.nom,
      groupeMusculaire: ex.groupe_musculaire,
      ordre: 0,
      seriesCible: 3,
      repsCible: 10,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-6 pb-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="p-2 rounded-xl"
          style={{ background: 'var(--bg-elevated)' }}
        >
          <X size={18} style={{ color: 'var(--text-primary)' }} />
        </button>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Ajouter un exercice
        </h2>
      </div>

      <div className="px-4 pt-4 pb-2 space-y-3">
        {/* Recherche texte */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            autoFocus
            type="text"
            placeholder="Rechercher un exercice..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Filtres groupe musculaire */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {['Tout', ...GROUPES].map((g) => {
            const active = g === 'Tout' ? !groupe : groupe === g;
            return (
              <button
                key={g}
                onClick={() => setGroupe(g === 'Tout' ? '' : g)}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                  color: active ? 'white' : 'var(--text-secondary)',
                }}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Résultats */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-8">
        {loading && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Chargement...
          </p>
        )}
        {!loading && results.length === 0 && (
          <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
            Aucun exercice trouvé
          </p>
        )}
        {results.map((ex) => (
          <button
            key={ex.id}
            onClick={() => handleAdd(ex)}
            className="w-full flex items-center justify-between p-4 rounded-xl text-left transition-opacity active:opacity-70"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {ex.nom}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {ex.groupe_musculaire}
                {ex.equipement ? ` · ${ex.equipement}` : ''}
              </p>
            </div>
            <Plus size={18} style={{ color: 'var(--accent)' }} />
          </button>
        ))}
      </div>
    </div>
  );
}
